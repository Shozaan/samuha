import { Prisma, Expense, ExpenseStatus } from '@prisma/client';
import prismaService from "../prismaService";

class ExpenseService {
    private prisma = prismaService.prisma;

    /**
     * Create a new expense
     */
    async create(data: Prisma.ExpenseCreateInput): Promise<Expense> {
        return await this.prisma.expense.create({
            data,
        });
    }

    /**
     * Get all expenses with pagination
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        status?: ExpenseStatus;
    } = {}) {
        const { page = 1, limit = 10, groupId, status } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ExpenseWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (status) where.status = status;

        const [expenses, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } },
                    suggestedBy: { select: { id: true, userId: true } } // Minimal
                }
            }),
            this.prisma.expense.count({ where }),
        ]);

        return {
            data: expenses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get expense by ID
     */
    async getById(id: string): Promise<Expense | null> {
        return await this.prisma.expense.findUnique({
            where: { id },
            include: {
                group: true,
                suggestedBy: true,
                transaction: true,
                receipt: true
            }
        });
    }

    /**
     * Update expense
     */
    async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
        return await this.prisma.expense.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete expense
     */
    async delete(id: string): Promise<void> {
        await this.prisma.expense.delete({
            where: { id },
        });
    }
}

export default new ExpenseService();
