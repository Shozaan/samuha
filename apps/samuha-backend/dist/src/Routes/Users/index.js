"use strict";
// src/routes/user.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Users_1 = __importDefault(require("../../Controllers/Users"));
const router = (0, express_1.Router)();
/**
 * User Routes
 * Base URL: /api/users
 */
// Create user
router.post('/', Users_1.default.createUser.bind(Users_1.default));
// Get all users with pagination and search
router.get('/', Users_1.default.getAllUsers.bind(Users_1.default));
// Get user stats
router.get('/stats/count', Users_1.default.getUserCount.bind(Users_1.default));
// Get user by ID
router.get('/:id', Users_1.default.getUserById.bind(Users_1.default));
// Get user by phone number
router.get('/phone/:phoneNumber', Users_1.default.getUserByPhoneNumber.bind(Users_1.default));
// Update user
router.put('/:id', Users_1.default.updateUser.bind(Users_1.default));
// Delete user
router.delete('/:id', Users_1.default.deleteUser.bind(Users_1.default));
exports.default = router;
