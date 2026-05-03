"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expense_service_1 = __importDefault(require("../../Services/Expenses/expense.service"));
class ExpenseController {
    /**
     * @route   POST /api/expenses
     * @desc    Create a new expense
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const expense = await expense_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Expense created successfully',
                data: expense,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/expenses
     * @desc    Get all expenses
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, status } = req.query;
            const result = await expense_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                status: status
            });
            res.status(200).json({
                success: true,
                message: 'Expenses retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/expenses/:id
     * @desc    Get expense by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const expense = await expense_service_1.default.getById(id);
            if (!expense) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Expense retrieved successfully',
                data: expense,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/expenses/:id
     * @desc    Update expense
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await expense_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }
            const updated = await expense_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Expense updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/expenses/:id
     * @desc    Delete expense
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await expense_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Expense not found',
                });
                return;
            }
            await expense_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Expense deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ExpenseController();
