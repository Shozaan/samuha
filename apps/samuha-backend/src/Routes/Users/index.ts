// src/routes/user.routes.ts

import { Router } from 'express';
import userController from '../../Controllers/Users';

const router = Router();

/**
 * User Routes
 * Base URL: /api/users
 */

// Create user
router.post('/', userController.createUser.bind(userController));

// Get all users with pagination and search
router.get('/', userController.getAllUsers.bind(userController));

// Get user stats
router.get('/stats/count', userController.getUserCount.bind(userController));

// Get user by ID
router.get('/:id', userController.getUserById.bind(userController));

// Get user by phone number
router.get('/phone/:phoneNumber', userController.getUserByPhoneNumber.bind(userController));

// Update user
router.put('/:id', userController.updateUser.bind(userController));

// Delete user
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;