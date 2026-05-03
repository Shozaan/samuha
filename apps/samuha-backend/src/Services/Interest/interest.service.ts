import { Prisma, BankInterest, InterestStatus } from '@prisma/client';
import prismaService from "../prismaService";

class InterestService {
    private prisma = prismaService.prisma;

    /**
     * Create a new interest record
     */
    async create(data: Prisma.BankInterestCreateInput): Promise<BankInterest> {
        return await this.prisma.bankInterest.create({
            data,
        });
    }

    /**
     * Get all interest records
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        status?: InterestStatus;
    } = {}) {
        const { page = 1, limit = 10, groupId, status } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.BankInterestWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (status) where.status = status;

        const [interests, total] = await Promise.all([
            this.prisma.bankInterest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { monthYear: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.bankInterest.count({ where }),
        ]);

        return {
            data: interests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get interest by ID
     */
    async getById(id: string): Promise<BankInterest | null> {
        return await this.prisma.bankInterest.findUnique({
            where: { id },
            include: {
                group: true,
                transaction: true
            }
        });
    }

    /**
     * Update interest
     */
    async update(id: string, data: Prisma.BankInterestUpdateInput): Promise<BankInterest> {
        return await this.prisma.bankInterest.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete interest
     */
    async delete(id: string): Promise<void> {
        await this.prisma.bankInterest.delete({
            where: { id },
        });
    }
}

export default new InterestService();
