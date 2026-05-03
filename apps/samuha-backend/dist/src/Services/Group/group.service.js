"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class GroupService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new group
     */
    async create(data) {
        return await this.prisma.group.create({
            data,
        });
    }
    /**
     * Get all groups
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, status, search } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.group.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete group
     */
    async delete(id) {
        await this.prisma.group.delete({
            where: { id },
        });
    }
}
exports.default = new GroupService();
