"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = __importDefault(require("../../Services/Notification/notification.service"));
class NotificationController {
    /**
     * @route   POST /api/notifications
     * @desc    Create a new notification (internal use mostly)
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const notification = await notification_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/notifications
     * @desc    Get all notifications
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, memberId, isRead } = req.query;
            const result = await notification_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                memberId: memberId,
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
            });
            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/notifications/:id/read
     * @desc    Mark notification as read
     * @access  Private
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await notification_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }
            const updated = await notification_service_1.default.markAsRead(id);
            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/notifications/:id
     * @desc    Delete notification
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await notification_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }
            await notification_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Notification deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new NotificationController();
