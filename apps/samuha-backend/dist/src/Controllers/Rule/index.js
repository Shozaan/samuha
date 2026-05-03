"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_service_1 = __importDefault(require("../../Services/Rule/rule.service"));
class RuleController {
    /**
     * @route   POST /api/rules
     * @desc    Create a new rule
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const rule = await rule_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Rule created successfully',
                data: rule,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/rules
     * @desc    Get all rules
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, ruleType } = req.query;
            const result = await rule_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                ruleType: ruleType
            });
            res.status(200).json({
                success: true,
                message: 'Rules retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/rules/active/:groupId
     * @desc    Get active rules for a group
     * @access  Private
     */
    async getActive(req, res, next) {
        try {
            const { groupId } = req.params;
            const rules = await rule_service_1.default.getActiveRules(groupId);
            res.status(200).json({
                success: true,
                message: 'Active rules retrieved successfully',
                data: rules,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/rules/:id
     * @desc    Get rule by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const rule = await rule_service_1.default.getById(id);
            if (!rule) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Rule retrieved successfully',
                data: rule,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/rules/:id
     * @desc    Update rule
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await rule_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }
            const updated = await rule_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Rule updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/rules/:id
     * @desc    Delete rule
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await rule_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }
            await rule_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Rule deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new RuleController();
