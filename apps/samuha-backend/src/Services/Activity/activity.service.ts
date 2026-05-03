import { Prisma, ActivityLog } from '@prisma/client';
import prismaService from "../prismaService";

class ActivityService {
    private prisma = prismaService.prisma;

    /**
     * Create a new activity log
     */
    async create(data: Prisma.ActivityLogCreateInput): Promise<ActivityLog> {
        return await this.prisma.activityLog.create({
            data,
        });
    }

    /**
     * Get all activity logs with pagination and filtering
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        entityType?: any; // Using any to avoid strict enum import issues if not needed, or better explicit import
    } = {}) {
        const { page = 1, limit = 10, groupId, entityType } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ActivityLogWhereInput = {};

        if (groupId) {
            where.groupId = groupId;
        }

        if (entityType) {
            where.entityType = entityType;
        }

        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.activityLog.count({ where }),
        ]);

        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get activity log by ID
     */
    async getById(id: string): Promise<ActivityLog | null> {
        return await this.prisma.activityLog.findUnique({
            where: { id },
            include: {
                group: true
            }
        });
    }

    /**
     * Delete activity log
     */
    async delete(id: string): Promise<void> {
        await this.prisma.activityLog.delete({
            where: { id },
        });
    }
}

export default new ActivityService();
