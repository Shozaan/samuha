"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interest_service_1 = __importDefault(require("../../Services/Interest/interest.service"));
class InterestController {
    /**
     * @route   POST /api/interests
     * @desc    Create a new interest record
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const interest = await interest_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Interest record created successfully',
                data: interest,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/interests
     * @desc    Get all interest records
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, status } = req.query;
            const result = await interest_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                status: status
            });
            res.status(200).json({
                success: true,
                message: 'Interest records retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/interests/:id
     * @desc    Get interest by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const interest = await interest_service_1.default.getById(id);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/interests/:id
     * @desc    Update interest
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await interest_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Interest record not found',
                });
                return;
            }
            const updated = await interest_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Interest record updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/interests/:id
     * @desc    Delete interest
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await interest_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Interest record not found',
                });
                return;
            }
            await interest_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Interest record deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new InterestController();
