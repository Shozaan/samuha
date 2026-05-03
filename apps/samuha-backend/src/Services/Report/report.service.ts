import { Prisma, MonthlyReport, ReportStatus } from '@prisma/client';
import prismaService from "../prismaService";

class ReportService {
    private prisma = prismaService.prisma;

    /**
     * Create a new report
     */
    async create(data: Prisma.MonthlyReportCreateInput): Promise<MonthlyReport> {
        return await this.prisma.monthlyReport.create({
            data,
        });
    }

    /**
     * Get all reports
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        monthYear?: string;
    } = {}) {
        const { page = 1, limit = 10, groupId, monthYear } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.MonthlyReportWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (monthYear) where.monthYear = monthYear;

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
    async getById(id: string): Promise<MonthlyReport | null> {
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
    async update(id: string, data: Prisma.MonthlyReportUpdateInput): Promise<MonthlyReport> {
        return await this.prisma.monthlyReport.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete report
     */
    async delete(id: string): Promise<void> {
        await this.prisma.monthlyReport.delete({
            where: { id },
        });
    }
}

export default new ReportService();
