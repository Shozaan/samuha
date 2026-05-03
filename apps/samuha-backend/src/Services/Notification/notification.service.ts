import { Prisma, Notification, NotificationStatus } from '@prisma/client';
import prismaService from "../prismaService";

class NotificationService {
    private prisma = prismaService.prisma;

    /**
     * Create a new notification
     */
    async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
        return await this.prisma.notification.create({
            data,
        });
    }

    /**
     * Get all notifications
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        memberId?: string;
        isRead?: boolean;
    } = {}) {
        const { page = 1, limit = 10, memberId, isRead } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NotificationWhereInput = {};

        if (memberId) where.memberId = memberId;
        if (isRead !== undefined) where.isRead = isRead;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get notification by ID
     */
    async getById(id: string): Promise<Notification | null> {
        return await this.prisma.notification.findUnique({
            where: { id },
        });
    }

    /**
     * Mark as read
     */
    async markAsRead(id: string): Promise<Notification> {
        return await this.prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date()
            },
        });
    }

    /**
     * Delete notification
     */
    async delete(id: string): Promise<void> {
        await this.prisma.notification.delete({
            where: { id },
        });
    }
}

export default new NotificationService();
