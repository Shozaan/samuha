"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_service_1 = __importDefault(require("../../Services/Group/group.service"));
class GroupController {
    /**
     * @route   POST /api/groups
     * @desc    Create a new group
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const group = await group_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Group created successfully',
                data: group,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/groups
     * @desc    Get all groups
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, status, search } = req.query;
            const result = await group_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
                search: search
            });
            res.status(200).json({
                success: true,
                message: 'Groups retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/groups/:id
     * @desc    Get group by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const group = await group_service_1.default.getById(id);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/groups/:id
     * @desc    Update group
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            // check exist
            const existing = await group_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found',
                });
                return;
            }
            const updated = await group_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Group updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/groups/:id
     * @desc    Delete group
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await group_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found',
                });
                return;
            }
            await group_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Group deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GroupController();
