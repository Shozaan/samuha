"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fine_service_1 = __importDefault(require("../../Services/Fine/fine.service"));
class FineController {
    /**
     * @route   POST /api/fines
     * @desc    Create a new fine
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const fine = await fine_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Fine created successfully',
                data: fine,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/fines
     * @desc    Get all fines
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, memberId, status } = req.query;
            const result = await fine_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                memberId: memberId,
                status: status
            });
            res.status(200).json({
                success: true,
                message: 'Fines retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/fines/:id
     * @desc    Get fine by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const fine = await fine_service_1.default.getById(id);
            if (!fine) {
                res.status(404).json({
                    success: false,
                    message: 'Fine not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Fine retrieved successfully',
                data: fine,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/fines/:id
     * @desc    Update fine
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            // check exist
            const existing = await fine_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Fine not found',
                });
                return;
            }
            const updated = await fine_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Fine updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/fines/:id
     * @desc    Delete fine
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await fine_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Fine not found',
                });
                return;
            }
            await fine_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Fine deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new FineController();
