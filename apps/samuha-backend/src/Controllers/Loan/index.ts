import { Request, Response, NextFunction } from 'express';
import loanService from '../../Services/Loan/loan.service';

class LoanController {
    /**
     * @route   POST /api/loans
     * @desc    Create a new loan
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const actor = req.body.actor; // { id, name, role } passed from frontend
            const loan = await loanService.create(req.body, actor);
            res.status(201).json({
                success: true,
                message: 'Loan created successfully',
                data: loan,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/loans
     * @desc    Get all loans
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, memberId, status } = req.query;

            const result = await loanService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                memberId: memberId as string,
                status: status as any
            });

            res.status(200).json({
                success: true,
                message: 'Loans retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/loans/:id
     * @desc    Get loan by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const loan = await loanService.getById(id);

            if (!loan) {
                res.status(404).json({
                    success: false,
                    message: 'Loan not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Loan retrieved successfully',
                data: loan,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/loans/:id
     * @desc    Update loan
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const existing = await loanService.getById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Loan not found' });
                return;
            }
            const actor = req.body.actor;
            const { actor: _actor, ...updateData } = req.body;
            const updated = await loanService.update(id, updateData, actor);
            res.status(200).json({
                success: true,
                message: 'Loan updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/loans/:id
     * @desc    Delete loan
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await loanService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Loan not found',
                });
                return;
            }

            await loanService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Loan deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    // --- REPAYMENTS ---

    /**
     * @route   GET /api/loans/:id/repayments
     * @desc    Get all repayments for a loan
     * @access  Private
     */
    async getRepayments(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repayments = await loanService.getRepayments(id);

            res.status(200).json({
                success: true,
                message: 'Repayments retrieved successfully',
                data: repayments,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/loans/repayments/:repaymentId
     * @desc    Update a specific repayment (e.g. mark as paid)
     * @access  Private
     */
    async updateRepayment(req: Request<{ repaymentId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { repaymentId } = req.params;
            const actor = req.body.actor;
            const { actor: _actor, ...updateData } = req.body;
            const updated = await loanService.updateRepayment(repaymentId, updateData, actor);
            res.status(200).json({
                success: true,
                message: 'Repayment updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new LoanController();
