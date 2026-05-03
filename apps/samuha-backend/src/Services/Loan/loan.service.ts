import { Prisma, Loan, LoanRepayment, LoanStatus, RepaymentStatus } from '@prisma/client';
import prismaService from "../prismaService";
import activityService from '../Activity/activity.service';

interface Actor { id: string; name: string; role: string; }

class LoanService {
    private prisma = prismaService.prisma;

    // --- LOAN METHODS ---

    /**
     * Create a new loan request
     */
    async create(data: {
        groupId: string;
        memberId: string;
        principalAmount: number;
        durationMonths: number;
        purpose?: string;
        notes?: string;
    }, actor?: Actor): Promise<Loan> {
        const principal = Number(data.principalAmount);
        const duration = Number(data.durationMonths);
        const interestRate = 12;
        const interestType = 'FLAT';
        const totalInterest = (principal * interestRate * (duration / 12)) / 100;
        const totalAmount = principal + totalInterest;
        const emiAmount = totalAmount / duration;
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const year = new Date().getFullYear();
        const loanNumber = `SMH/${year}/LOAN/${randomHex}`;

        const loan = await this.prisma.loan.create({
            data: {
                group: { connect: { id: data.groupId } },
                member: { connect: { id: data.memberId } },
                loanNumber,
                principalAmount: principal,
                interestRate,
                interestType,
                durationMonths: duration,
                totalInterest,
                totalAmount,
                emiAmount,
                purpose: data.purpose,
                notes: data.notes,
                status: 'REQUESTED'
            },
        });

        if (actor) {
            await activityService.create({
                group: { connect: { id: data.groupId } },
                activityType: 'CREATE',
                entityType: 'LOAN',
                entityId: loan.id,
                actorId: actor.id,
                actorName: actor.name,
                actorRole: actor.role as any,
                action: 'Requested loan',
                description: `${actor.name} requested a loan of NPR ${principal.toLocaleString()} for ${duration} months${data.purpose ? ` (${data.purpose})` : ''}`,
            });
        }

        return loan;
    }

    /**
     * Get all loans
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        memberId?: string;
        status?: LoanStatus;
    } = {}) {
        const { page = 1, limit = 10, groupId, memberId, status } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.LoanWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (memberId) where.memberId = memberId;
        if (status) where.status = status;

        const [loans, total] = await Promise.all([
            this.prisma.loan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } },
                    member: { include: { user: { select: { name: true } } } },
                    repayments: { select: { paidAmount: true } }
                }
            }),
            this.prisma.loan.count({ where }),
        ]);

        return {
            data: loans,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get loan by ID
     */
    async getById(id: string): Promise<Loan | null> {
        return await this.prisma.loan.findUnique({
            where: { id },
            include: {
                group: true,
                member: { include: { user: true } },
                repayments: {
                    orderBy: { emiNumber: 'asc' }
                },
                transaction: true,
                receipt: true
            }
        });
    }

    /**
     * Update loan
     */
    async update(id: string, data: Prisma.LoanUpdateInput, actor?: Actor): Promise<Loan> {
        const updatedLoan = await this.prisma.loan.update({ where: { id }, data });

        // If newly activated, generate the repayment schedule!
        if ((updatedLoan.status as string) === 'ACTIVE') {
            const existingRepayments = await this.prisma.loanRepayment.count({ where: { loanId: id } });
            if (existingRepayments === 0) {
                const emiAmount = Number(updatedLoan.emiAmount);
                const duration = updatedLoan.durationMonths;
                const startDate = updatedLoan.disbursedAt ? new Date(updatedLoan.disbursedAt) : new Date();

                const scheduleData = Array.from({ length: duration }).map((_, index) => {
                    const dueDate = new Date(startDate);
                    dueDate.setMonth(dueDate.getMonth() + index + 1);
                    return {
                        loanId: id,
                        memberId: updatedLoan.memberId,
                        emiNumber: index + 1,
                        dueDate,
                        principalAmount: Number(updatedLoan.principalAmount) / duration,
                        interestAmount: Number(updatedLoan.totalInterest) / duration,
                        totalAmount: emiAmount,
                        status: 'PENDING' as RepaymentStatus
                    };
                });

                await this.prisma.loanRepayment.createMany({ data: scheduleData });
            }
        }

        // Log activity
        if (actor) {
            let activityType: any = 'UPDATE';
            let action = 'Updated loan';
            let description = `${actor.name} updated loan ${updatedLoan.loanNumber}`;

            if (updatedLoan.status === 'APPROVED') {
                activityType = 'APPROVE';
                action = 'Approved loan';
                description = `${actor.name} approved loan ${updatedLoan.loanNumber} for NPR ${Number(updatedLoan.principalAmount).toLocaleString()}`;
            } else if (updatedLoan.status === 'ACTIVE') {
                activityType = 'DISBURSE';
                action = 'Disbursed loan';
                description = `${actor.name} disbursed loan ${updatedLoan.loanNumber} — NPR ${Number(updatedLoan.principalAmount).toLocaleString()} over ${updatedLoan.durationMonths} months`;
            } else if (updatedLoan.status === 'REJECTED') {
                activityType = 'REJECT';
                action = 'Rejected loan';
                description = `${actor.name} rejected loan request ${updatedLoan.loanNumber}`;
            }

            await activityService.create({
                group: { connect: { id: updatedLoan.groupId } },
                activityType,
                entityType: 'LOAN',
                entityId: updatedLoan.id,
                actorId: actor.id,
                actorName: actor.name,
                actorRole: actor.role as any,
                action,
                description,
            });
        }

        return updatedLoan;
    }

    /**
     * Delete loan
     */
    async delete(id: string): Promise<void> {
        await this.prisma.loan.delete({
            where: { id },
        });
    }

    // --- REPAYMENT METHODS ---

    /**
     * Get repayments for a loan
     */
    async getRepayments(loanId: string): Promise<LoanRepayment[]> {
        return await this.prisma.loanRepayment.findMany({
            where: { loanId },
            orderBy: { emiNumber: 'asc' }
        });
    }

    /**
     * Update repayment
     */
    async updateRepayment(id: string, data: Prisma.LoanRepaymentUpdateInput, actor?: Actor): Promise<LoanRepayment> {
        const repayment = await this.prisma.loanRepayment.update({
            where: { id },
            data,
            include: { loan: { select: { groupId: true } } }
        }) as LoanRepayment & { loan: { groupId: string } };

        if (actor) {
            const isPaid = data.status === 'PAID';
            await activityService.create({
                group: { connect: { id: repayment.loan.groupId } },
                activityType: isPaid ? 'CONFIRM' : 'UPDATE',
                entityType: 'REPAYMENT',
                entityId: repayment.id,
                actorId: actor.id,
                actorName: actor.name,
                actorRole: actor.role as any,
                action: isPaid ? 'Confirmed EMI payment' : 'Submitted EMI payment request',
                description: isPaid
                    ? `${actor.name} confirmed EMI #${repayment.emiNumber} payment of NPR ${Number(repayment.totalAmount).toLocaleString()}`
                    : `${actor.name} submitted payment request for EMI #${repayment.emiNumber}`,
            });
        }

        return repayment;
    }
}

export default new LoanService();
