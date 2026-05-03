import { Prisma, GroupBalance } from '@prisma/client';
import prismaService from "../prismaService";

class BalanceService {
    private prisma = prismaService.prisma;

    /**
     * Create a new balance record
     */
    async create(data: Prisma.GroupBalanceCreateInput): Promise<GroupBalance> {
        return await this.prisma.groupBalance.create({
            data,
        });
    }

    /**
     * Get all balances with pagination
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
    } = {}) {
        const { page = 1, limit = 10, groupId } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.GroupBalanceWhereInput = {};

        if (groupId) {
            where.groupId = groupId;
        }

        const [balances, total] = await Promise.all([
            this.prisma.groupBalance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.groupBalance.count({ where }),
        ]);

        return {
            data: balances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get latest balance for a group
     */
    async getLatestByGroupId(groupId: string): Promise<GroupBalance | null> {
        return await this.prisma.groupBalance.findFirst({
            where: { groupId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get balance by ID
     */
    async getById(id: string): Promise<GroupBalance | null> {
        return await this.prisma.groupBalance.findUnique({
            where: { id },
            include: {
                group: true,
                transaction: true
            }
        });
    }
}

export default new BalanceService();
