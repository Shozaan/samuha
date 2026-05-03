import { Request, Response, NextFunction } from 'express';
import groupService from '../../Services/Group/group.service';

class GroupController {
    /**
     * @route   POST /api/groups
     * @desc    Create a new group
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const group = await groupService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Group created successfully',
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/groups
     * @desc    Get all groups
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, status, search } = req.query;

            const result = await groupService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                status: status as any,
                search: search as string
            });

            res.status(200).json({
                success: true,
                message: 'Groups retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/groups/:id
     * @desc    Get group by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const group = await groupService.getById(id);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Group retrieved successfully',
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/groups/:id
     * @desc    Update group
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // check exist
            const existing = await groupService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found',
                });
                return;
            }

            const updated = await groupService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Group updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/groups/:id
     * @desc    Delete group
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await groupService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found',
                });
                return;
            }

            await groupService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Group deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new GroupController();
