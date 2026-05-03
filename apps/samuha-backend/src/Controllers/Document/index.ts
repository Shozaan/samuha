import { Request, Response, NextFunction } from 'express';
import documentService from '../../Services/Document/document.service';

class DocumentController {
    /**
     * @route   POST /api/documents
     * @desc    Create a new document record
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const document = await documentService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Document record created successfully',
                data: document,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/documents
     * @desc    Get all documents
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, type, entityType } = req.query;

            const result = await documentService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                type: type as any,
                entityType: entityType as any
            });

            res.status(200).json({
                success: true,
                message: 'Documents retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/documents/:id
     * @desc    Get document by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const document = await documentService.getById(id);

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
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/documents/:id
     * @desc    Update document
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await documentService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
                return;
            }

            const updated = await documentService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Document updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/documents/:id
     * @desc    Delete document
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await documentService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
                return;
            }

            await documentService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Document deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DocumentController();
