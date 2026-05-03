"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class RuleService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new rule
     */
    async create(data) {
        return await this.prisma.groupRule.create({
            data,
        });
    }
    /**
     * Get all rules
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, ruleType } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (ruleType)
            where.ruleType = ruleType;
        const [rules, total] = await Promise.all([
            this.prisma.groupRule.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.groupRule.count({ where }),
        ]);
        return {
            data: rules,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get rule by ID
     */
    async getById(id) {
        return await this.prisma.groupRule.findUnique({
            where: { id },
            include: {
                group: true,
            }
        });
    }
    /**
     * Update rule
     */
    async update(id, data) {
        return await this.prisma.groupRule.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete rule
     */
    async delete(id) {
        await this.prisma.groupRule.delete({
            where: { id },
        });
    }
    /**
     * Get active rules for a group
     */
    async getActiveRules(groupId) {
        return await this.prisma.groupRule.findMany({
            where: {
                groupId,
                isActive: true
            }
        });
    }
}
exports.default = new RuleService();
