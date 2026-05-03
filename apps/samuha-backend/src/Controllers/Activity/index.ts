import { Request, Response, NextFunction } from 'express';
import activityService from '../../Services/Activity/activity.service';

class ActivityController {
    /**
     * @route   GET /api/activities
     * @desc    Get all activity logs for a group with pagination
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, entityType } = req.query;
            const result = await activityService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
                groupId: groupId as string,
                entityType: entityType as any,
            });
            res.status(200).json({
                success: true,
                message: 'Activity logs retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/activities/:id
     * @desc    Get a single activity log by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const log = await activityService.getById(req.params.id);
            if (!log) {
                res.status(404).json({ success: false, message: 'Activity log not found' });
                return;
            }
            res.status(200).json({ success: true, data: log });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/activities/:id
     * @desc    Delete an activity log
     * @access  Admin
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            await activityService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Activity log deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export default new ActivityController();
