import prismaService from '../prismaService';

const DEPOSIT_FINE_MAX_PER_MONTH = 300;
const EMI_FINE_RATE_PER_DAY = 0.005; // 0.5%
const LOAN_OVERDUE_MONTHLY_RATE = 0.02; // 2%

class FineService {
    private prisma = prismaService.prisma;

    /**
     * Entry point: calculates and upserts all fines across all groups.
     * Safe to run daily via cron or on demand via API.
     */
    async runFineEngine() {
        console.log('[FineEngine] Starting...');
        const groups = await this.prisma.group.findMany({
            include: {
                rules: { where: { isActive: true } }
            }
        });

        const results = { groups: 0, depositFines: 0, emiFines: 0, overdueLoanFines: 0 };

        for (const group of groups) {
            const activeRule = group.rules[0];
            const lateFinePerDay = activeRule?.lateFinePerDay ? Number(activeRule.lateFinePerDay) : 10;

            const [d, e, l] = await Promise.all([
                this.processDepositFines(group.id, lateFinePerDay),
                this.processLoanEmiFines(group.id),
                this.processLoanPeriodOverdueFines(group.id),
            ]);

            results.groups++;
            results.depositFines += d;
            results.emiFines += e;
            results.overdueLoanFines += l;
        }

        console.log('[FineEngine] Done:', results);
        return results;
    }

    /**
     * Deposit Fines:
     * - fine per day * days overdue, capped at 300 per month per missed deposit
     */
    private async processDepositFines(groupId: string, lateFinePerDay: number): Promise<number> {
        const today = new Date();
        let count = 0;

        const overdueDeposits = await this.prisma.deposit.findMany({
            where: {
                groupId,
                status: { in: ['PENDING', 'LATE'] },
                dueDate: { lt: today },
            },
        });

        for (const deposit of overdueDeposits) {
            const daysOverdue = Math.floor(
                (today.getTime() - new Date(deposit.dueDate).getTime()) / (1000 * 3600 * 24)
            );

            if (daysOverdue <= 0) continue;

            // Cap at 300 per "month billing window" (each missed deposit is its own window)
            const calculatedFine = Math.min(daysOverdue * lateFinePerDay, DEPOSIT_FINE_MAX_PER_MONTH);

            if (deposit.fineId) {
                await this.prisma.fine.update({
                    where: { id: deposit.fineId },
                    data: {
                        amount: calculatedFine,
                        reason: `Late deposit for ${deposit.monthYear} (${daysOverdue} days overdue)`,
                    },
                });
            } else {
                const newFine = await this.prisma.fine.create({
                    data: {
                        memberId: deposit.memberId,
                        fineType: 'LATE_DEPOSIT',
                        amount: calculatedFine,
                        reason: `Late deposit for ${deposit.monthYear} (${daysOverdue} days overdue)`,
                        status: 'PENDING',
                    },
                });
                await this.prisma.deposit.update({
                    where: { id: deposit.id },
                    data: {
                        fineId: newFine.id,
                        fineAmount: calculatedFine,
                        status: 'LATE',
                    },
                });
            }
            count++;
        }
        return count;
    }

    /**
     * EMI Fines:
     * - 0.5% of EMI amount per day overdue, accumulates daily
     */
    private async processLoanEmiFines(groupId: string): Promise<number> {
        const today = new Date();
        let count = 0;

        const overdueRepayments = await this.prisma.loanRepayment.findMany({
            where: {
                loan: { groupId },
                status: { in: ['PENDING', 'LATE'] },
                dueDate: { lt: today },
            },
        });

        for (const repayment of overdueRepayments) {
            const daysOverdue = Math.floor(
                (today.getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 3600 * 24)
            );

            if (daysOverdue <= 0) continue;

            const emiAmount = Number(repayment.totalAmount);
            const calculatedFine = Number((emiAmount * EMI_FINE_RATE_PER_DAY * daysOverdue).toFixed(2));

            // Mark repayment as LATE
            await this.prisma.loanRepayment.update({
                where: { id: repayment.id },
                data: { status: 'LATE' },
            });

            if (repayment.fineId) {
                await this.prisma.fine.update({
                    where: { id: repayment.fineId },
                    data: {
                        amount: calculatedFine,
                        reason: `Late EMI #${repayment.emiNumber} payment (${daysOverdue} days overdue)`,
                    },
                });
            } else {
                const existingFine = await this.prisma.fine.findFirst({
                    where: {
                        memberId: repayment.memberId,
                        fineType: 'LATE_EMI',
                        status: 'PENDING',
                        repayments: { some: { id: repayment.id } },
                    },
                });

                if (existingFine) {
                    await this.prisma.fine.update({
                        where: { id: existingFine.id },
                        data: {
                            amount: calculatedFine,
                            reason: `Late EMI #${repayment.emiNumber} payment (${daysOverdue} days overdue)`,
                        },
                    });
                    await this.prisma.loanRepayment.update({
                        where: { id: repayment.id },
                        data: { fineId: existingFine.id, fineAmount: calculatedFine },
                    });
                } else {
                    const newFine = await this.prisma.fine.create({
                        data: {
                            memberId: repayment.memberId,
                            fineType: 'LATE_EMI',
                            amount: calculatedFine,
                            reason: `Late EMI #${repayment.emiNumber} payment (${daysOverdue} days overdue)`,
                            status: 'PENDING',
                        },
                    });
                    await this.prisma.loanRepayment.update({
                        where: { id: repayment.id },
                        data: { fineId: newFine.id, fineAmount: calculatedFine },
                    });
                }
            }
            count++;
        }
        return count;
    }

    /**
     * Loan Period Overdue Fines:
     * - Loans still ACTIVE past maturity date
     * - Compound 2% monthly on remaining outstanding balance
     * - Recorded as a Fine (type: OTHER) — updated in place each run
     */
    private async processLoanPeriodOverdueFines(groupId: string): Promise<number> {
        const today = new Date();
        let count = 0;

        const activeLoans = await this.prisma.loan.findMany({
            where: { groupId, status: 'ACTIVE' },
            include: { repayments: { select: { paidAmount: true } } },
        });

        for (const loan of activeLoans) {
            if (!loan.disbursedAt) continue;

            const maturityDate = new Date(loan.disbursedAt);
            maturityDate.setMonth(maturityDate.getMonth() + loan.durationMonths);

            if (today <= maturityDate) continue;

            const monthsOverdue = Math.max(
                1,
                Math.floor((today.getTime() - maturityDate.getTime()) / (1000 * 3600 * 24 * 30))
            );

            const totalPaid = loan.repayments.reduce(
                (sum: number, r: { paidAmount: any }) => sum + (r.paidAmount ? Number(r.paidAmount) : 0),
                0
            );
            const remainingBalance = Number(loan.totalAmount) - totalPaid;

            if (remainingBalance <= 0) continue;

            // Compound: balance * (1.02^months) - balance
            const compoundMultiplier = Math.pow(1 + LOAN_OVERDUE_MONTHLY_RATE, monthsOverdue);
            const calculatedFine = Number((remainingBalance * compoundMultiplier - remainingBalance).toFixed(2));

            const reason = `Loan overdue - ${loan.loanNumber} (${monthsOverdue} months past maturity, balance: ${remainingBalance})`;

            const existingFine = await this.prisma.fine.findFirst({
                where: {
                    memberId: loan.memberId,
                    fineType: 'OTHER',
                    status: 'PENDING',
                    reason: { contains: loan.loanNumber },
                },
            });

            if (existingFine) {
                await this.prisma.fine.update({
                    where: { id: existingFine.id },
                    data: { amount: calculatedFine, reason },
                });
            } else {
                await this.prisma.fine.create({
                    data: {
                        memberId: loan.memberId,
                        fineType: 'OTHER',
                        amount: calculatedFine,
                        reason,
                        status: 'PENDING',
                    },
                });
            }
            count++;
        }
        return count;
    }

    /** Get all fines for a member */
    async getByMember(memberId: string) {
        return this.prisma.fine.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Get all fines for a group */
    async getByGroup(groupId: string) {
        return this.prisma.fine.findMany({
            where: { member: { groupId } },
            include: { member: { include: { user: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Mark fine as paid */
    async markPaid(fineId: string, paymentMode: string) {
        return this.prisma.fine.update({
            where: { id: fineId },
            data: {
                status: 'PAID',
                paidDate: new Date(),
                paymentMode: paymentMode as any,
            },
        });
    }

    /** Waive a fine */
    async waive(fineId: string, waivedBy: string, reason: string) {
        return this.prisma.fine.update({
            where: { id: fineId },
            data: {
                status: 'WAIVED',
                isWaived: true,
                waivedBy,
                waiverReason: reason,
                waivedAt: new Date(),
            },
        });
    }
}

export default new FineService();
