"use strict";
// src/services/user.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaService_1 = __importDefault(require("../prismaService"));
class UserService {
    constructor() {
        this.prisma = prismaService_1.default.prisma;
    }
    /**
     * Create a new user
     */
    async createUser(data) {
        try {
            const user = await this.prisma.user.create({
                data,
            });
            return user;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Phone number already exists');
            }
            throw error;
        }
    }
    /**
     * Get all users with pagination
     */
    async getAllUsers(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phoneNumber: { contains: search } },
                ],
            }
            : {};
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    phoneNumber: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    lastLoginAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                phoneNumber: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    /**
     * Get user by phone number
     */
    async getUserByPhoneNumber(phoneNumber) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    /**
     * Update user
     */
    async updateUser(id, data) {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return user;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            if (error.code === 'P2002') {
                throw new Error('Phone number already exists');
            }
            throw error;
        }
    }
    /**
     * Delete user
     */
    async deleteUser(id) {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw error;
        }
    }
    /**
     * Update last login
     */
    async updateLastLogin(id) {
        await this.prisma.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }
    /**
     * Get user count
     */
    async getUserCount() {
        return await this.prisma.user.count();
    }
    /**
     * Check if phone number exists
     */
    async phoneNumberExists(phoneNumber) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        return !!user;
    }
}
exports.default = new UserService();
