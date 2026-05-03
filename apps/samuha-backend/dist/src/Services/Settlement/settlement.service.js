"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class SettlementService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new settlement
     */
    async create(data) {
        return await this.prisma.finalSettlement.create({
            data,
        });
    }
    /**
     * Get all settlements
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, memberId, status } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (memberId)
            where.memberId = memberId;
        if (status)
            where.status = status;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.finalSettlement.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete settlement
     */
    async delete(id) {
        await this.prisma.finalSettlement.delete({
            where: { id },
        });
    }
}
exports.default = new SettlementService();
