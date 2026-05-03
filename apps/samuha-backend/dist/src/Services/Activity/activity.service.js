"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class ActivityService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new activity log
     */
    async create(data) {
        return await this.prisma.activityLog.create({
            data,
        });
    }
    /**
     * Get all activity logs with pagination and filtering
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, entityType } = options;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getById(id) {
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
    async delete(id) {
        await this.prisma.activityLog.delete({
            where: { id },
        });
    }
}
exports.default = new ActivityService();
