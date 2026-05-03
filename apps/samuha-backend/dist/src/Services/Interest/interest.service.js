"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class InterestService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new interest record
     */
    async create(data) {
        return await this.prisma.bankInterest.create({
            data,
        });
    }
    /**
     * Get all interest records
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, status } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (status)
            where.status = status;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.bankInterest.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete interest
     */
    async delete(id) {
        await this.prisma.bankInterest.delete({
            where: { id },
        });
    }
}
exports.default = new InterestService();
