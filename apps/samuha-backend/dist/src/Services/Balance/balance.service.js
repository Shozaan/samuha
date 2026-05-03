"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class BalanceService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new balance record
     */
    async create(data) {
        return await this.prisma.groupBalance.create({
            data,
        });
    }
    /**
     * Get all balances with pagination
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId) {
            where.groupId = groupId;
        }
        const [balances, total] = await Promise.all([
            this.prisma.groupBalance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.groupBalance.count({ where }),
        ]);
        return {
            data: balances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get latest balance for a group
     */
    async getLatestByGroupId(groupId) {
        return await this.prisma.groupBalance.findFirst({
            where: { groupId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get balance by ID
     */
    async getById(id) {
        return await this.prisma.groupBalance.findUnique({
            where: { id },
            include: {
                group: true,
                transaction: true
            }
        });
    }
}
exports.default = new BalanceService();
