"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const balance_service_1 = __importDefault(require("../../Services/Balance/balance.service"));
class BalanceController {
    /**
     * @route   GET /api/balances
     * @desc    Get all balance records
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId } = req.query;
            const result = await balance_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
            });
            res.status(200).json({
                success: true,
                message: 'Balance records retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/balances/latest/:groupId
     * @desc    Get latest balance for a group
     * @access  Private
     */
    async getLatest(req, res, next) {
        try {
            const { groupId } = req.params;
            const balance = await balance_service_1.default.getLatestByGroupId(groupId);
            if (!balance) {
                res.status(404).json({
                    success: false,
                    message: 'No balance records found for this group',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Latest balance retrieved successfully',
                data: balance,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/balances/:id
     * @desc    Get balance by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const balance = await balance_service_1.default.getById(id);
            if (!balance) {
                res.status(404).json({
                    success: false,
                    message: 'Balance record not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Balance record retrieved successfully',
                data: balance,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new BalanceController();
