"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_service_1 = __importDefault(require("../../Services/Report/report.service"));
class ReportController {
    /**
     * @route   POST /api/reports
     * @desc    Create a new report
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const report = await report_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Report created successfully',
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/reports
     * @desc    Get all reports
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, monthYear } = req.query;
            const result = await report_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                monthYear: monthYear
            });
            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/reports/:id
     * @desc    Get report by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const report = await report_service_1.default.getById(id);
            if (!report) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Report retrieved successfully',
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/reports/:id
     * @desc    Update report
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await report_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }
            const updated = await report_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Report updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/reports/:id
     * @desc    Delete report
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await report_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Report not found',
                });
                return;
            }
            await report_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Report deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ReportController();
