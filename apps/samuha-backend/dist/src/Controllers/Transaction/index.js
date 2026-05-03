"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_service_1 = __importDefault(require("../../Services/Transaction/transaction.service"));
class TransactionController {
    /**
     * @route   POST /api/transactions
     * @desc    Create a new transaction
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const transaction = await transaction_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/transactions
     * @desc    Get all transactions
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, type, category } = req.query;
            const result = await transaction_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                type: type,
                category: category
            });
            res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/transactions/:id
     * @desc    Get transaction by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const transaction = await transaction_service_1.default.getById(id);
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Transaction retrieved successfully',
                data: transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/transactions/:id
     * @desc    Delete transaction
     * @access  Private (Admin only)
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await transaction_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                });
                return;
            }
            await transaction_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TransactionController();
