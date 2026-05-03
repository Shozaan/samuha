"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class TransactionService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new transaction
     */
    async create(data) {
        return await this.prisma.transaction.create({
            data,
        });
    }
    /**
     * Get all transactions
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, type, category } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (type)
            where.transactionType = type;
        if (category)
            where.category = category;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.transaction.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete transaction (Usually restricted)
     */
    async delete(id) {
        await this.prisma.transaction.delete({
            where: { id },
        });
    }
}
exports.default = new TransactionService();
