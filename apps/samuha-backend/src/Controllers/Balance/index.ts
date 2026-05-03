import { Request, Response, NextFunction } from 'express';
import balanceService from '../../Services/Balance/balance.service';

class BalanceController {
    /**
     * @route   GET /api/balances
     * @desc    Get all balance records
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId } = req.query;

            const result = await balanceService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
            });

            res.status(200).json({
                success: true,
                message: 'Balance records retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/balances/latest/:groupId
     * @desc    Get latest balance for a group
     * @access  Private
     */
    async getLatest(req: Request<{ groupId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId } = req.params;
            const balance = await balanceService.getLatestByGroupId(groupId);

            if (!balance) {
                res.status(404).json({
                    success: false,
                    message: 'No balance records found for this group',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Latest balance retrieved successfully',
                data: balance,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/balances/:id
     * @desc    Get balance by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const balance = await balanceService.getById(id);

            if (!balance) {
                res.status(404).json({
                    success: false,
                    message: 'Balance record not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Balance record retrieved successfully',
                data: balance,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new BalanceController();
