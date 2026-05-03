"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deposit_service_1 = __importDefault(require("../../Services/Deposit/deposit.service"));
class DepositController {
    /**
     * @route   POST /api/deposits
     * @desc    Create a new deposit
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const deposit = await deposit_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Deposit created successfully',
                data: deposit,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                res.status(409).json({
                    success: false,
                    message: 'Deposit already exists for this member and month',
                });
                return;
            }
            next(error);
        }
    }
    /**
     * @route   GET /api/deposits
     * @desc    Get all deposits
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, memberId, status, monthYear } = req.query;
            const result = await deposit_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                memberId: memberId,
                status: status,
                monthYear: monthYear
            });
            res.status(200).json({
                success: true,
                message: 'Deposits retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/deposits/:id
     * @desc    Get deposit by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const deposit = await deposit_service_1.default.getById(id);
            if (!deposit) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Deposit retrieved successfully',
                data: deposit,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/deposits/:id
     * @desc    Update deposit
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            // Check existence
            const existing = await deposit_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }
            const updated = await deposit_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Deposit updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/deposits/:id
     * @desc    Delete deposit
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await deposit_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }
            await deposit_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Deposit deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DepositController();
