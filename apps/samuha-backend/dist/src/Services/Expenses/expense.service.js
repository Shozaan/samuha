"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class ExpenseService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new expense
     */
    async create(data) {
        return await this.prisma.expense.create({
            data,
        });
    }
    /**
     * Get all expenses with pagination
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, status } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (status)
            where.status = status;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.expense.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete expense
     */
    async delete(id) {
        await this.prisma.expense.delete({
            where: { id },
        });
    }
}
exports.default = new ExpenseService();
