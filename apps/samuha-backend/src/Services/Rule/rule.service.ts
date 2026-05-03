import { Prisma, GroupRule, RuleType } from '@prisma/client';
import prismaService from "../prismaService";

class RuleService {
    private prisma = prismaService.prisma;

    /**
     * Create a new rule
     */
    async create(data: Prisma.GroupRuleCreateInput): Promise<GroupRule> {
        return await this.prisma.groupRule.create({
            data,
        });
    }

    /**
     * Get all rules
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        ruleType?: RuleType;
    } = {}) {
        const { page = 1, limit = 10, groupId, ruleType } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.GroupRuleWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (ruleType) where.ruleType = ruleType;

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
    async getById(id: string): Promise<GroupRule | null> {
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
    async update(id: string, data: Prisma.GroupRuleUpdateInput): Promise<GroupRule> {
        return await this.prisma.groupRule.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete rule
     */
    async delete(id: string): Promise<void> {
        await this.prisma.groupRule.delete({
            where: { id },
        });
    }

    /**
     * Get active rules for a group
     */
    async getActiveRules(groupId: string): Promise<GroupRule[]> {
        return await this.prisma.groupRule.findMany({
            where: {
                groupId,
                isActive: true
            }
        });
    }
}

export default new RuleService();
