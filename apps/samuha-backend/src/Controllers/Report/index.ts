import { Request, Response, NextFunction } from 'express';
import reportService from '../../Services/Report/report.service';
import prismaService from '../../Services/prismaService';

const prisma = prismaService.prisma;

class ReportController {
    /**
     * @route   GET /api/reports/monthly?groupId=&year=
     * @desc    Compute monthly financial summaries from live data
     * @access  Private
     */
    async getMonthly(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId, year } = req.query as { groupId?: string; year?: string };

            if (!groupId) {
                res.status(400).json({ success: false, message: 'groupId is required' });
                return;
            }

            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            const now = new Date();

            // All YYYY-MM for the target year, capped at current month
            const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const months: string[] = Array.from({ length: 12 }, (_, i) => {
                const m = String(i + 1).padStart(2, '0');
                return `${targetYear}-${m}`;
            }).filter(m => m <= currentMonthYear);

            const yearStart = new Date(`${targetYear}-01-01`);
            const yearEnd = new Date(`${targetYear + 1}-01-01`);

            const [deposits, loans, repayments, fines] = await Promise.all([
                prisma.deposit.findMany({
                    where: { groupId, monthYear: { in: months }, status: 'PAID' },
                    select: { monthYear: true, amount: true }
                }),
                prisma.loan.findMany({
                    where: {
                        groupId,
                        disbursedAt: { gte: yearStart, lt: yearEnd },
                        status: { in: ['ACTIVE', 'COMPLETED', 'DEFAULTED'] }
                    },
                    select: { disbursedAt: true, principalAmount: true }
                }),
                prisma.loanRepayment.findMany({
                    where: {
                        loan: { groupId },
                        status: 'PAID',
                        paidDate: { gte: yearStart, lt: yearEnd }
                    },
                    select: { paidDate: true, totalAmount: true }
                }),
                prisma.fine.findMany({
                    where: {
                        member: { groupId },
                        status: 'PAID',
                        paidDate: { gte: yearStart, lt: yearEnd }
                    },
                    select: { paidDate: true, amount: true }
                }),
            ]);

            const toMY = (d: Date) => {
                const date = new Date(d);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            };

            const sumByMonth = <T>(items: T[], keyFn: (item: T) => string | null, valFn: (item: T) => number): Record<string, number> => {
                const map: Record<string, number> = {};
                items.forEach(item => {
                    const k = keyFn(item);
                    if (k) map[k] = (map[k] || 0) + valFn(item);
                });
                return map;
            };

            const depByMonth = sumByMonth(deposits, d => d.monthYear, d => Number(d.amount));
            const loanByMonth = sumByMonth(loans, l => l.disbursedAt ? toMY(l.disbursedAt) : null, l => Number(l.principalAmount));
            const repByMonth = sumByMonth(repayments, r => r.paidDate ? toMY(r.paidDate) : null, r => Number(r.totalAmount));
            const fineByMonth = sumByMonth(fines, f => f.paidDate ? toMY(f.paidDate) : null, f => Number(f.amount));

            const data = months
                .map(monthYear => ({
                    monthYear,
                    totalDeposits: depByMonth[monthYear] || 0,
                    totalLoans: loanByMonth[monthYear] || 0,
                    totalRepayments: repByMonth[monthYear] || 0,
                    totalFines: fineByMonth[monthYear] || 0,
                }))
                .filter(m => m.totalDeposits + m.totalLoans + m.totalRepayments + m.totalFines > 0)
                .reverse();

            // Determine available years from earliest group deposit
            const earliest = await prisma.deposit.findFirst({
                where: { groupId },
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true }
            });
            const earliestYear = earliest ? new Date(earliest.createdAt).getFullYear() : targetYear;
            const availableYears = Array.from(
                { length: now.getFullYear() - earliestYear + 1 },
                (_, i) => now.getFullYear() - i
            );

            res.status(200).json({
                success: true,
                data,
                meta: { year: targetYear, availableYears },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/reports
     * @desc    Create a new report
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await reportService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Report created successfully',
                data: report,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/reports
     * @desc    Get all reports
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, monthYear } = req.query;

            const result = await reportService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                monthYear: monthYear as string
            });

            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/reports/:id
     * @desc    Get report by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const report = await reportService.getById(id);

            if (!report) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Report retrieved successfully',
                data: report,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/reports/:id
     * @desc    Update report
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await reportService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }

            const updated = await reportService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Report updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/reports/:id
     * @desc    Delete report
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await reportService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }

            await reportService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Report deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
