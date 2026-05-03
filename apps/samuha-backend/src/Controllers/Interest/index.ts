import { Request, Response, NextFunction } from 'express';
import interestService from '../../Services/Interest/interest.service';

class InterestController {
    /**
     * @route   POST /api/interests
     * @desc    Create a new interest record
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const interest = await interestService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Interest record created successfully',
                data: interest,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/interests
     * @desc    Get all interest records
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, status } = req.query;

            const result = await interestService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                status: status as any
            });

            res.status(200).json({
                success: true,
                message: 'Interest records retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/interests/:id
     * @desc    Get interest by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const interest = await interestService.getById(id);

            if (!interest) {
                res.status(404).json({
                    success: false,
                    message: 'Interest record not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Interest record retrieved successfully',
                data: interest,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/interests/:id
     * @desc    Update interest
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await interestService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Interest record not found',
                });
                return;
            }

            const updated = await interestService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Interest record updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/interests/:id
     * @desc    Delete interest
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await interestService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Interest record not found',
                });
                return;
            }

            await interestService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Interest record deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new InterestController();
