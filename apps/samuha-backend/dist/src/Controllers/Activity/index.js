"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const activity_service_1 = __importDefault(require("../../Services/Activity/activity.service"));
class ActivityController {
    /**
     * @route   GET /api/activities
     * @desc    Get all activity logs
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, entityType } = req.query;
            const result = await activity_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                entityType: entityType
            });
            res.status(200).json({
                success: true,
                message: 'Activity logs retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/activities/:id
     * @desc    Get activity log by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const log = await activity_service_1.default.getById(id);
            if (!log) {
                res.status(404).json({
                    success: false,
                    message: 'Activity log not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Activity log retrieved successfully',
                data: log,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/activities/:id
     * @desc    Delete activity log
     * @access  Private (Admin only)
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            // Check if exists
            const existing = await activity_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Activity log not found',
                });
                return;
            }
            await activity_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Activity log deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ActivityController();
