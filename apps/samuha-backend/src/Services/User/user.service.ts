// src/services/user.service.ts

import { Prisma, User } from '@prisma/client';
import prismaService from "../prismaService";

interface GetUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
}

interface PaginatedUsers {
    users: Partial<User>[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class UserService {
    private prisma = prismaService.prisma;

    /**
     * Create a new user
     */
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        try {
            const user = await this.prisma.user.create({
                data,
            });
            return user;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new Error('Phone number already exists');
            }
            throw error;
        }
    }

    /**
     * Get all users with pagination
     */
    async getAllUsers(options: GetUsersOptions = {}): Promise<PaginatedUsers> {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
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
    async getUserById(id: string): Promise<Partial<User>> {
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
    async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
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
    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<Partial<User>> {
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
        } catch (error: any) {
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
    async deleteUser(id: string): Promise<void> {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw error;
        }
    }

    /**
     * Update last login
     */
    async updateLastLogin(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }

    /**
     * Get user count
     */
    async getUserCount(): Promise<number> {
        return await this.prisma.user.count();
    }

    /**
     * Check if phone number exists
     */
    async phoneNumberExists(phoneNumber: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        return !!user;
    }
}

export default new UserService();