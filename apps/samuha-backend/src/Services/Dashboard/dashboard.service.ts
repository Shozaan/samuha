import prismaService from "../prismaService";

class DashboardService {
    private prisma = prismaService.prisma;

    /**
     * Get aggregate statistics for a group
     */
    async getGroupStats(groupId: string) {
        // Run all aggregations in parallel for performance
        const [
            totalMembers,
            depositAgg,
            activeLoansAgg,
            repaymentAgg,
            fineAgg,
            serviceChargeAgg,
            recentTransactions
        ] = await Promise.all([
            // 1. Member count
            this.prisma.member.count({
                where: { groupId, status: 'ACTIVE' }
            }),
            // 2. Total deposits — sum all PAID deposits directly from Deposit table
            this.prisma.deposit.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'PAID' }
            }),
            // 3. Active loans — APPROVED, DISBURSED and ACTIVE are all "out"
            this.prisma.loan.aggregate({
                _sum: { principalAmount: true },
                where: {
                    groupId,
                    status: { in: ['APPROVED', 'DISBURSED', 'ACTIVE'] }
                }
            }),
            // 4. Total repayments received (principal recovered)
            this.prisma.loanRepayment.aggregate({
                _sum: { principalAmount: true },
                where: { loan: { groupId }, status: 'PAID' }
            }),
            // 5. Total fines collected
            this.prisma.fine.aggregate({
                _sum: { amount: true },
                where: { member: { groupId }, status: 'PAID' }
            }),
            // 6. Service charges collected (1% on loan approval)
            this.prisma.loan.aggregate({
                _sum: { serviceChargeAmount: true } as any,
                where: { groupId, serviceChargeAmount: { not: null } } as any
            }),
            // 7. Recent activity
            this.prisma.transaction.findMany({
                where: { groupId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    deposit: { include: { member: { include: { user: { select: { name: true } } } } } },
                    loan: { include: { member: { include: { user: { select: { name: true } } } } } },
                    repayment: { include: { member: { include: { user: { select: { name: true } } } } } },
                    fine: { include: { member: { include: { user: { select: { name: true } } } } } }
                }
            })
        ]);

        const totalDeposits = depositAgg._sum.amount?.toNumber() || 0;
        const loansOut = activeLoansAgg._sum.principalAmount?.toNumber() || 0;
        const repaymentsIn = repaymentAgg._sum.principalAmount?.toNumber() || 0;
        const finesCollected = fineAgg._sum.amount?.toNumber() || 0;
        const totalServiceCharges = (serviceChargeAgg as any)._sum.serviceChargeAmount?.toNumber() || 0;

        // Total group fund = all money that came in
        // = Deposits + Fines + Repayments + Service charges (1% on loan approval)
        const totalGroupFund = totalDeposits + finesCollected + repaymentsIn + totalServiceCharges;

        // Available balance = total fund minus what's currently lent out (not yet repaid)
        const activeLoans = Math.max(0, loansOut - repaymentsIn);
        const availableBalance = Math.max(0, totalGroupFund - activeLoans);

        const recentActivity = recentTransactions.map((tx: any) => {
            let user = 'System/Admin';
            if (tx.deposit?.member?.user?.name) user = tx.deposit.member.user.name;
            else if (tx.loan?.member?.user?.name) user = tx.loan.member.user.name;
            else if (tx.repayment?.member?.user?.name) user = tx.repayment.member.user.name;
            else if (tx.fine?.member?.user?.name) user = tx.fine.member.user.name;

            return {
                id: tx.id,
                type: tx.category.toLowerCase(),
                user,
                amount: tx.creditAmount ? tx.creditAmount.toNumber() : (tx.debitAmount ? tx.debitAmount.toNumber() : 0),
                date: tx.createdAt,
                status: 'Completed',
                description: tx.description
            };
        });

        return {
            totalMembers,
            totalGroupFund,
            availableBalance,
            totalDeposits,
            activeLoans,
            recentActivity
        };
    }

    /**
     * Get aggregate statistics for a specific member
     */
    async getMemberStats(groupId: string, memberId: string) {
        // 1. Total Deposits
        const depositAgg = await this.prisma.deposit.aggregate({
            _sum: { amount: true },
            where: { groupId, memberId, status: 'PAID' }
        });
        const totalDeposit = depositAgg._sum.amount?.toNumber() || 0;

        // 2. Active Loan
        const loanAgg = await this.prisma.loan.aggregate({
            _sum: { principalAmount: true },
            where: { groupId, memberId, status: 'ACTIVE' }
        });
        const activeLoan = loanAgg._sum.principalAmount?.toNumber() || 0;

        // 3. Pending Fines
        const pendingFinesAgg = await this.prisma.fine.aggregate({
            _sum: { amount: true },
            where: { memberId, status: 'PENDING' }
        });
        const pendingFines = pendingFinesAgg._sum?.amount?.toNumber() || 0;

        // 4. Total Fines Paid
        const paidFinesAgg = await this.prisma.fine.aggregate({
            _sum: { amount: true },
            where: { memberId, status: 'PAID' }
        });
        const totalFinesPaid = paidFinesAgg._sum?.amount?.toNumber() || 0;

        // 5. Next Installment Date
        const nextDeposit = await this.prisma.deposit.findFirst({
            where: { groupId, memberId, status: 'PENDING' },
            orderBy: { dueDate: 'asc' }
        });

        // 6. To get average 'Amount Per Head'
        const totalMembers = await this.prisma.member.count({
            where: { groupId, status: 'ACTIVE' }
        });
        // Calculate totalGroupFund directly from source tables
        const [memberDepAgg, memberFineAgg, memberRepayAgg] = await Promise.all([
            this.prisma.deposit.aggregate({ _sum: { amount: true }, where: { groupId, status: 'PAID' } }),
            this.prisma.fine.aggregate({ _sum: { amount: true }, where: { member: { groupId }, status: 'PAID' } }),
            this.prisma.loanRepayment.aggregate({ _sum: { principalAmount: true }, where: { loan: { groupId }, status: 'PAID' } })
        ]);
        const totalGroupFund =
            (memberDepAgg._sum.amount?.toNumber() || 0) +
            (memberFineAgg._sum.amount?.toNumber() || 0) +
            (memberRepayAgg._sum.principalAmount?.toNumber() || 0);

        const amountPerHead = totalMembers > 0 ? Math.floor(totalGroupFund / totalMembers) : 0;

        return {
            totalDeposit,
            activeLoan,
            pendingFines,
            nextInstallment: nextDeposit ? nextDeposit.dueDate : null,
            totalFinesPaid,
            amountPerHead: Math.floor(amountPerHead)
        };
    }
}

export default new DashboardService();
