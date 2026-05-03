import { Request, Response, NextFunction } from 'express';
import notificationService from '../../Services/Notification/notification.service';

class NotificationController {
    /**
     * @route   POST /api/notifications
     * @desc    Create a new notification (internal use mostly)
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notification = await notificationService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/notifications
     * @desc    Get all notifications
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, memberId, isRead } = req.query;

            const result = await notificationService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                memberId: memberId as string,
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
            });

            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/notifications/:id/read
     * @desc    Mark notification as read
     * @access  Private
     */
    async markAsRead(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await notificationService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }

            const updated = await notificationService.markAsRead(id);

            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/notifications/:id
     * @desc    Delete notification
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await notificationService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }

            await notificationService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Notification deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
