"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class ReportService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new report
     */
    async create(data) {
        return await this.prisma.monthlyReport.create({
            data,
        });
    }
    /**
     * Get all reports
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, monthYear } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (monthYear)
            where.monthYear = monthYear;
        const [reports, total] = await Promise.all([
            this.prisma.monthlyReport.findMany({
                where,
                skip,
                take: limit,
                orderBy: { monthYear: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.monthlyReport.count({ where }),
        ]);
        return {
            data: reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get report by ID
     */
    async getById(id) {
        return await this.prisma.monthlyReport.findUnique({
            where: { id },
            include: {
                group: true,
            }
        });
    }
    /**
     * Generate/Update report
     */
    async update(id, data) {
        return await this.prisma.monthlyReport.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete report
     */
    async delete(id) {
        await this.prisma.monthlyReport.delete({
            where: { id },
        });
    }
}
exports.default = new ReportService();
