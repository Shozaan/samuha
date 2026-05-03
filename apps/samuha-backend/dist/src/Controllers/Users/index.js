"use strict";
// src/controllers/user.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../../Services/User/user.service"));
class UserController {
    /**
     * @route   POST /api/users
     * @desc    Create a new user
     * @access  Public
     */
    async createUser(req, res, next) {
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
            const exists = await user_service_1.default.phoneNumberExists(phoneNumber);
            if (exists) {
                res.status(409).json({
                    success: false,
                    message: 'Phone number already registered',
                });
                return;
            }
            const user = await user_service_1.default.createUser({
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/users
     * @desc    Get all users
     * @access  Public
     */
    async getAllUsers(req, res, next) {
        try {
            const { page, limit, search } = req.query;
            const result = await user_service_1.default.getAllUsers({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                search: search || '',
            });
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result.users,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route   GET /api/users/:id
     * @desc    Get user by ID
     * @access  Public
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.getUserById(id);
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            });
        }
        catch (error) {
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
    async getUserByPhoneNumber(req, res, next) {
        try {
            const { phoneNumber } = req.params;
            const user = await user_service_1.default.getUserByPhoneNumber(phoneNumber);
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            });
        }
        catch (error) {
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
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, phoneNumber } = req.body;
            const user = await user_service_1.default.updateUser(id, {
                name,
                phoneNumber,
            });
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user,
            });
        }
        catch (error) {
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
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            await user_service_1.default.deleteUser(id);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
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
    async getUserCount(req, res, next) {
        try {
            const count = await user_service_1.default.getUserCount();
            res.status(200).json({
                success: true,
                message: 'User count retrieved successfully',
                data: { count },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
