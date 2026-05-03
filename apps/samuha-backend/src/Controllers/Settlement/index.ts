import { Request, Response, NextFunction } from 'express';
import settlementService from '../../Services/Settlement/settlement.service';

class SettlementController {
    /**
     * @route   POST /api/settlements
     * @desc    Create a new settlement
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settlement = await settlementService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Settlement created successfully',
                data: settlement,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/settlements
     * @desc    Get all settlements
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, memberId, status } = req.query;

            const result = await settlementService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                memberId: memberId as string,
                status: status as any
            });

            res.status(200).json({
                success: true,
                message: 'Settlements retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/settlements/:id
     * @desc    Get settlement by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const settlement = await settlementService.getById(id);

            if (!settlement) {
                res.status(404).json({
                    success: false,
                    message: 'Settlement not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Settlement retrieved successfully',
                data: settlement,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/settlements/:id
     * @desc    Update settlement
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await settlementService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Settlement not found',
                });
                return;
            }

            const updated = await settlementService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Settlement updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/settlements/:id
     * @desc    Delete settlement
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await settlementService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Settlement not found',
                });
                return;
            }

            await settlementService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Settlement deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SettlementController();
