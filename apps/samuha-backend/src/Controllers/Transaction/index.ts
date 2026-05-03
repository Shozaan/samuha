import { Request, Response, NextFunction } from 'express';
import transactionService from '../../Services/Transaction/transaction.service';

class TransactionController {
    /**
     * @route   POST /api/transactions
     * @desc    Create a new transaction
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const transaction = await transactionService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/transactions
     * @desc    Get all transactions
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, type, category } = req.query;

            const result = await transactionService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                type: type as any,
                category: category as any
            });

            res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/transactions/:id
     * @desc    Get transaction by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const transaction = await transactionService.getById(id);

            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Transaction retrieved successfully',
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/transactions/:id
     * @desc    Delete transaction
     * @access  Private (Admin only)
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await transactionService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                });
                return;
            }

            await transactionService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TransactionController();
