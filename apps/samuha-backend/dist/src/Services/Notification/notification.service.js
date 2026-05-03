"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class NotificationService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new notification
     */
    async create(data) {
        return await this.prisma.notification.create({
            data,
        });
    }
    /**
     * Get all notifications
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, memberId, isRead } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (memberId)
            where.memberId = memberId;
        if (isRead !== undefined)
            where.isRead = isRead;
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
    async getById(id) {
        return await this.prisma.notification.findUnique({
            where: { id },
        });
    }
    /**
     * Mark as read
     */
    async markAsRead(id) {
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
    async delete(id) {
        await this.prisma.notification.delete({
            where: { id },
        });
    }
}
exports.default = new NotificationService();
