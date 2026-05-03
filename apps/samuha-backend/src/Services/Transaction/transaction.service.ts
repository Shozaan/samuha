import { Prisma, Transaction, TransactionType, TransactionCategory } from '@prisma/client';
import prismaService from "../prismaService";

class TransactionService {
    private prisma = prismaService.prisma;

    /**
     * Create a new transaction
     */
    async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
        return await this.prisma.transaction.create({
            data,
        });
    }

    /**
     * Get all transactions
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        type?: TransactionType;
        category?: TransactionCategory;
    } = {}) {
        const { page = 1, limit = 10, groupId, type, category } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.TransactionWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (type) where.transactionType = type;
        if (category) where.category = category;

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get transaction by ID
     */
    async getById(id: string): Promise<Transaction | null> {
        return await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                group: true,
                deposit: true,
                loan: true,
                repayment: true,
                fine: true,
                expense: true,
                bankInterest: true,
                balanceSnapshot: true
            }
        });
    }

    /**
     * Update transaction (Usually restricted)
     */
    async update(id: string, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
        return await this.prisma.transaction.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete transaction (Usually restricted)
     */
    async delete(id: string): Promise<void> {
        await this.prisma.transaction.delete({
            where: { id },
        });
    }
}

export default new TransactionService();
