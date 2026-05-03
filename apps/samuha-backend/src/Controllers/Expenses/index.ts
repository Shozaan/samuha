import { Request, Response, NextFunction } from 'express';
import expenseService from '../../Services/Expenses/expense.service';

class ExpenseController {
    /**
     * @route   POST /api/expenses
     * @desc    Create a new expense
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const expense = await expenseService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Expense created successfully',
                data: expense,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/expenses
     * @desc    Get all expenses
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, status } = req.query;

            const result = await expenseService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                status: status as any
            });

            res.status(200).json({
                success: true,
                message: 'Expenses retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/expenses/:id
     * @desc    Get expense by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const expense = await expenseService.getById(id);

            if (!expense) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Expense retrieved successfully',
                data: expense,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/expenses/:id
     * @desc    Update expense
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await expenseService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }

            const updated = await expenseService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Expense updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/expenses/:id
     * @desc    Delete expense
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await expenseService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }

            await expenseService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Expense deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ExpenseController();
