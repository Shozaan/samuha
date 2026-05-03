"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_service_1 = __importDefault(require("../../Services/Document/document.service"));
class DocumentController {
    /**
     * @route   POST /api/documents
     * @desc    Create a new document record
     * @access  Private
     */
    async create(req, res, next) {
        try {
            const document = await document_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Document record created successfully',
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/documents
     * @desc    Get all documents
     * @access  Private
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, groupId, type, entityType } = req.query;
            const result = await document_service_1.default.getAll({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                groupId: groupId,
                type: type,
                entityType: entityType
            });
            res.status(200).json({
                success: true,
                message: 'Documents retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/documents/:id
     * @desc    Get document by ID
     * @access  Private
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const document = await document_service_1.default.getById(id);
            if (!document) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Document retrieved successfully',
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   PUT /api/documents/:id
     * @desc    Update document
     * @access  Private
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await document_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
                return;
            }
            const updated = await document_service_1.default.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Document updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   DELETE /api/documents/:id
     * @desc    Delete document
     * @access  Private
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await document_service_1.default.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
                return;
            }
            await document_service_1.default.delete(id);
            res.status(200).json({
                success: true,
                message: 'Document deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DocumentController();
