import { Request, Response, NextFunction } from 'express';
import depositService from '../../Services/Deposit/deposit.service';

class DepositController {
    /**
     * @route   POST /api/deposits
     * @desc    Create a new deposit
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const deposit = await depositService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Deposit created successfully',
                data: deposit,
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(409).json({
                    success: false,
                    message: 'Deposit already exists for this member and month',
                });
                return;
            }
            next(error);
        }
    }

    /**
     * @route   GET /api/deposits
     * @desc    Get all deposits
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, memberId, status, monthYear } = req.query;

            const result = await depositService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                memberId: memberId as string,
                status: status as any,
                monthYear: monthYear as string
            });

            res.status(200).json({
                success: true,
                message: 'Deposits retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/deposits/:id
     * @desc    Get deposit by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deposit = await depositService.getById(id);

            if (!deposit) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Deposit retrieved successfully',
                data: deposit,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/deposits/:id
     * @desc    Update deposit
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Check existence
            const existing = await depositService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }

            const updated = await depositService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Deposit updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/deposits/:id
     * @desc    Delete deposit
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await depositService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }

            await depositService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Deposit deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DepositController();
