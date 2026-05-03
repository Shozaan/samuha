"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class DepositService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new deposit
     */
    async create(data) {
        // Check for existing duplicate deposit (group, member, monthYear)
        // Prisma @unique([groupId, memberId, monthYear]) will handle the constraint, but we can check nicely if we want.
        // For now, let Prisma throw P2002 and handle it in controller or service wrapper.
        return await this.prisma.deposit.create({
            data,
        });
    }
    /**
     * Get all deposits with pagination and filtering
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, memberId, status, monthYear } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (memberId)
            where.memberId = memberId;
        if (status)
            where.status = status;
        if (monthYear)
            where.monthYear = monthYear;
        const [deposits, total] = await Promise.all([
            this.prisma.deposit.findMany({
                where,
                skip,
                take: limit,
                orderBy: { monthYear: 'desc' }, // or createdAt
                include: {
                    member: { select: { id: true, userId: true, role: true } }, // Minimal member info
                    group: { select: { name: true } }
                }
            }),
            this.prisma.deposit.count({ where }),
        ]);
        return {
            data: deposits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get deposit by ID
     */
    async getById(id) {
        return await this.prisma.deposit.findUnique({
            where: { id },
            include: {
                group: true,
                member: true,
                fine: true,
                transaction: true,
                receipt: true
            }
        });
    }
    /**
     * Update deposit
     */
    async update(id, data) {
        return await this.prisma.deposit.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete deposit
     */
    async delete(id) {
        await this.prisma.deposit.delete({
            where: { id },
        });
    }
}
exports.default = new DepositService();
