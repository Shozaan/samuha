import { Request, Response, NextFunction } from 'express';
import reportService from '../../Services/Report/report.service';

class ReportController {
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
