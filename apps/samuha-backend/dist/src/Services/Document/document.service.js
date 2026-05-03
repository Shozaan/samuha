"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class DocumentService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new document record
     */
    async create(data) {
        return await this.prisma.document.create({
            data,
        });
    }
    /**
     * Get all documents
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, groupId, type, entityType } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (groupId)
            where.groupId = groupId;
        if (type)
            where.documentType = type;
        if (entityType)
            where.entityType = entityType;
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
    async getById(id) {
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
    async update(id, data) {
        return await this.prisma.document.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete document
     */
    async delete(id) {
        await this.prisma.document.delete({
            where: { id },
        });
    }
}
exports.default = new DocumentService();
