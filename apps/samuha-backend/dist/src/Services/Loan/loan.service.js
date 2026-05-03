"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class LoanService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    // --- LOAN METHODS ---
    /**
     * Create a new loan request
     */
    async create(data) {
        return await this.prisma.loan.create({
            data,
        });
    }
    /**
     * Get all loans
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, memberId, status } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (memberId)
            where.memberId = memberId;
        if (status)
            where.status = status;
        const [loans, total] = await Promise.all([
            this.prisma.loan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } },
                    member: { select: { id: true, userId: true } }
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
    async getById(id) {
        return await this.prisma.loan.findUnique({
            where: { id },
            include: {
                group: true,
                member: true,
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
    async update(id, data) {
        return await this.prisma.loan.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete loan
     */
    async delete(id) {
        await this.prisma.loan.delete({
            where: { id },
        });
    }
    // --- REPAYMENT METHODS ---
    /**
     * Get repayments for a loan
     */
    async getRepayments(loanId) {
        return await this.prisma.loanRepayment.findMany({
            where: { loanId },
            orderBy: { emiNumber: 'asc' }
        });
    }
    /**
     * Update repayment
     */
    async updateRepayment(id, data) {
        return await this.prisma.loanRepayment.update({
            where: { id },
            data,
        });
    }
}
exports.default = new LoanService();
