import { Prisma, Member, MemberStatus, MemberRole } from '@prisma/client';
import prismaService from "../prismaService";

class MemberService {
    private prisma = prismaService.prisma;

    /**
     * Assign a user to a group (create a Member record)
     */
    async assignToGroup(data: {
        userId: string;
        groupId: string;
        relation?: string;
        role?: MemberRole;
        status?: MemberStatus;
        addedById?: string;
    }): Promise<Member> {
        return await this.prisma.member.create({
            data: {
                userId: data.userId,
                groupId: data.groupId,
                relation: data.relation,
                role: data.role || 'MEMBER',
                status: data.status || 'ACTIVE',
                addedById: data.addedById,
            },
            include: {
                user: true,
                group: true,
            }
        });
    }

    /**
     * Get all members with optional filtering
     */
    async getAll(options: {
        groupId?: string;
        userId?: string;
        page?: number;
        limit?: number;
        status?: MemberStatus;
    } = {}) {
        const { page = 1, limit = 10, groupId, userId, status } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.MemberWhereInput = {};
        if (groupId) where.groupId = groupId;
        if (userId) where.userId = userId;
        if (status) where.status = status;

        const [members, total] = await Promise.all([
            this.prisma.member.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    group: true,
                    _count: {
                        select: {
                            deposits: true,
                            loans: true,
                        }
                    }
                }
            }),
            this.prisma.member.count({ where }),
        ]);

        return {
            data: members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get member by ID with financial summary
     */
    async getById(id: string) {
        const [member, depositAgg, activeLoansAgg, totalLoansAgg, repaymentAgg] = await Promise.all([
            this.prisma.member.findUnique({
                where: { id },
                include: {
                    user: true,
                    group: true,
                }
            }),
            // Total paid deposits
            this.prisma.deposit.aggregate({
                _sum: { amount: true },
                where: { memberId: id, status: 'PAID' }
            }),
            // Active loan principal outstanding
            this.prisma.loan.aggregate({
                _sum: { principalAmount: true },
                where: { memberId: id, status: { in: ['APPROVED', 'DISBURSED', 'ACTIVE'] } }
            }),
            // Lifetime total loans taken
            this.prisma.loan.aggregate({
                _sum: { principalAmount: true },
                where: { memberId: id }
            }),
            // Total principal repaid
            this.prisma.loanRepayment.aggregate({
                _sum: { principalAmount: true },
                where: { memberId: id, status: 'PAID' }
            })
        ]);

        if (!member) return null;

        const totalDeposits = depositAgg._sum.amount?.toNumber() || 0;
        const activeLoanPrincipal = activeLoansAgg._sum.principalAmount?.toNumber() || 0;
        const totalLoansPrincipal = totalLoansAgg._sum.principalAmount?.toNumber() || 0;
        const totalRepaid = repaymentAgg._sum.principalAmount?.toNumber() || 0;

        // Repayment progress as a percentage of total loans taken
        const repaymentProgress = totalLoansPrincipal > 0
            ? Math.min(100, Math.round((totalRepaid / totalLoansPrincipal) * 100))
            : 0;

        return {
            ...member,
            financialSummary: {
                totalDeposits,
                activeLoanPrincipal,
                totalLoansPrincipal,
                totalRepaid,
                repaymentProgress,
            }
        };
    }

    /**
     * Update member details
     */
    async update(id: string, data: Prisma.MemberUpdateInput): Promise<Member> {
        return await this.prisma.member.update({
            where: { id },
            data,
            include: {
                user: true,
                group: true,
            }
        });
    }

    /**
     * Remove member from group (delete record)
     */
    async remove(id: string): Promise<void> {
        await this.prisma.member.delete({
            where: { id },
        });
    }

    /**
     * Check if user is already a member of a group
     */
    async isMember(userId: string, groupId: string): Promise<boolean> {
        const member = await this.prisma.member.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                }
            }
        });
        return !!member;
    }
}

export default new MemberService();
