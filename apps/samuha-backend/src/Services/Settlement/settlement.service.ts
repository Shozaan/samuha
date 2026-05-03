import { Prisma, FinalSettlement, SettlementStatus } from '@prisma/client';
import prismaService from "../prismaService";

class SettlementService {
    private prisma = prismaService.prisma;

    /**
     * Create a new settlement
     */
    async create(data: Prisma.FinalSettlementCreateInput): Promise<FinalSettlement> {
        return await this.prisma.finalSettlement.create({
            data,
        });
    }

    /**
     * Get all settlements
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        memberId?: string;
        status?: SettlementStatus;
    } = {}) {
        const { page = 1, limit = 10, memberId, status } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.FinalSettlementWhereInput = {};

        if (memberId) where.memberId = memberId;
        if (status) where.status = status;

        const [settlements, total] = await Promise.all([
            this.prisma.finalSettlement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    member: { select: { id: true, userId: true } }
                }
            }),
            this.prisma.finalSettlement.count({ where }),
        ]);

        return {
            data: settlements,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get settlement by ID
     */
    async getById(id: string): Promise<FinalSettlement | null> {
        return await this.prisma.finalSettlement.findUnique({
            where: { id },
            include: {
                member: true,
            }
        });
    }

    /**
     * Update settlement
     */
    async update(id: string, data: Prisma.FinalSettlementUpdateInput): Promise<FinalSettlement> {
        return await this.prisma.finalSettlement.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete settlement
     */
    async delete(id: string): Promise<void> {
        await this.prisma.finalSettlement.delete({
            where: { id },
        });
    }
}

export default new SettlementService();
