"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loan_service_1 = __importDefault(require("../../Services/Loan/loan.service"));
class LoanController {
    /**
     * @route   POST /api/loans
     * @desc    Create a new loan
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const loan = await loan_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Loan created successfully',
                data: loan,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/loans
     * @desc    Get all loans
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, memberId, status } = req.query;
            const result = await loan_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                memberId: memberId,
                status: status
            });
            res.status(200).json({
                success: true,
                message: 'Loans retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/loans/:id
     * @desc    Get loan by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const loan = await loan_service_1.default.getById(id);
            if (!loan) {
                res.status(404).json({
                    success: false,
                    message: 'Loan not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Loan retrieved successfully',
                data: loan,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/loans/:id
     * @desc    Update loan
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await loan_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Loan not found',
                });
                return;
            }
            const updated = await loan_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Loan updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/loans/:id
     * @desc    Delete loan
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await loan_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Loan not found',
                });
                return;
            }
            await loan_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Loan deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // --- REPAYMENTS ---
    /**
     * @route   GET /api/loans/:id/repayments
     * @desc    Get all repayments for a loan
     * @access  Private
     */
    async getRepayments(req, res, next) {
        try {
            const { id } = req.params;
            const repayments = await loan_service_1.default.getRepayments(id);
            res.status(200).json({
                success: true,
                message: 'Repayments retrieved successfully',
                data: repayments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/loans/repayments/:repaymentId
     * @desc    Update a specific repayment (e.g. mark as paid)
     * @access  Private
     */
    async updateRepayment(req, res, next) {
        try {
            const { repaymentId } = req.params;
            const updated = await loan_service_1.default.updateRepayment(repaymentId, req.body);
            res.status(200).json({
                success: true,
                message: 'Repayment updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new LoanController();
