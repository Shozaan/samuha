"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class FineService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new fine
     */
    async create(data) {
        return await this.prisma.fine.create({
            data,
        });
    }
    /**
     * Get all fines
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, memberId, status } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (memberId)
            where.memberId = memberId;
        if (status)
            where.status = status;
        const [fines, total] = await Promise.all([
            this.prisma.fine.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    member: { select: { id: true, userId: true } }
                }
            }),
            this.prisma.fine.count({ where }),
        ]);
        return {
            data: fines,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get fine by ID
     */
    async getById(id) {
        return await this.prisma.fine.findUnique({
            where: { id },
            include: {
                member: true,
                receipt: true,
                transaction: true
            }
        });
    }
    /**
     * Update fine
     */
    async update(id, data) {
        return await this.prisma.fine.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete fine
     */
    async delete(id) {
        await this.prisma.fine.delete({
            where: { id },
        });
    }
}
exports.default = new FineService();
