import { Prisma, Group, GroupStatus } from '@prisma/client';
import prismaService from "../prismaService";

class GroupService {
    private prisma = prismaService.prisma;

    /**
     * Create a new group
     */
    async create(data: Prisma.GroupCreateInput): Promise<Group> {
        return await this.prisma.group.create({
            data,
        });
    }

    /**
     * Get all groups
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        status?: GroupStatus;
        search?: string;
    } = {}) {
        const { page = 1, limit = 10, status, search } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.GroupWhereInput = {};

        if (status) where.status = status;
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const [groups, total] = await Promise.all([
            this.prisma.group.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { members: true }
                    }
                }
            }),
            this.prisma.group.count({ where }),
        ]);

        return {
            data: groups,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get group by ID
     */
    async getById(id: string): Promise<Group | null> {
        return await this.prisma.group.findUnique({
            where: { id },
            include: {
                members: true,
                rules: true
            }
        });
    }

    /**
     * Update group
     */
    async update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
        return await this.prisma.group.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete group
     */
    async delete(id: string): Promise<void> {
        await this.prisma.group.delete({
            where: { id },
        });
    }
}

export default new GroupService();
