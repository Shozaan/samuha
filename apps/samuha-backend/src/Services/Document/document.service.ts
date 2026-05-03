import { Prisma, Document, DocumentType, EntityType } from '@prisma/client';
import prismaService from "../prismaService";

class DocumentService {
    private prisma = prismaService.prisma;

    /**
     * Create a new document record
     */
    async create(data: Prisma.DocumentCreateInput): Promise<Document> {
        return await this.prisma.document.create({
            data,
        });
    }

    /**
     * Get all documents
     */
    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        type?: DocumentType;
        entityType?: EntityType;
    } = {}) {
        const { page = 1, limit = 10, groupId, type, entityType } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DocumentWhereInput = {};

        if (groupId) where.groupId = groupId;
        if (type) where.documentType = type;
        if (entityType) where.entityType = entityType;

        const [documents, total] = await Promise.all([
            this.prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: { select: { name: true } }
                }
            }),
            this.prisma.document.count({ where }),
        ]);

        return {
            data: documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get document by ID
     */
    async getById(id: string): Promise<Document | null> {
        return await this.prisma.document.findUnique({
            where: { id },
            include: {
                group: true,
            }
        });
    }

    /**
     * Update document
     */
    async update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
        return await this.prisma.document.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete document
     */
    async delete(id: string): Promise<void> {
        await this.prisma.document.delete({
            where: { id },
        });
    }
}

export default new DocumentService();
