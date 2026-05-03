// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import userService from '../../Services/User/user.service';

class UserController {
    /**
     * @route   POST /api/users
     * @desc    Create a new user
     * @access  Public
     */
    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { phoneNumber, name, password, userName, email } = req.body;

            // Validation
            if (!phoneNumber || !name) {
                res.status(400).json({
                    success: false,
                    message: 'Phone number and name are required',
                });
                return;
            }

            // Check if phone number already exists
            const exists = await userService.phoneNumberExists(phoneNumber);
            if (exists) {
                res.status(409).json({
                    success: false,
                    message: 'Phone number already registered',
                });
                return;
            }

            const user = await userService.createUser({
                phoneNumber,
                name,
                passwordHash: password,
                userName: userName || '',
                email: email || ''
            });

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/users
     * @desc    Get all users
     * @access  Public
     */
    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, search } = req.query;

            const result = await userService.getAllUsers({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                search: (search as string) || '',
            });

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/users/:id
     * @desc    Get user by ID
     * @access  Public
     */
    async getUserById(req: Request<{ id: string }>,
        res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const user = await userService.getUserById(id);

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    /**
     * @route   GET /api/users/phone/:phoneNumber
     * @desc    Get user by phone number
     * @access  Public
     */
    async getUserByPhoneNumber(req: Request<{ phoneNumber: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { phoneNumber } = req.params;

            const user = await userService.getUserByPhoneNumber(phoneNumber);

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    /**
     * @route   PUT /api/users/:id
     * @desc    Update user
     * @access  Public
     */
    async updateUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, phoneNumber } = req.body;

            const user = await userService.updateUser(id, {
                name,
                phoneNumber,
            });

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user,
            });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message === 'Phone number already exists') {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    /**
     * @route   DELETE /api/users/:id
     * @desc    Delete user
     * @access  Public
     */
    async deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            await userService.deleteUser(id);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    /**
     * @route   GET /api/users/stats/count
     * @desc    Get total user count
     * @access  Public
     */
    async getUserCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await userService.getUserCount();

            res.status(200).json({
                success: true,
                message: 'User count retrieved successfully',
                data: { count },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();