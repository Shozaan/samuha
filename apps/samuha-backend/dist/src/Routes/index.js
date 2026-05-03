"use strict";
// src/routes/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Users_1 = __importDefault(require("../Routes/Users"));
const prismaService_1 = __importDefault(require("../Services/prismaService"));
const router = (0, express_1.Router)();
/**
 * API Routes
 * Base URL: /api
 */
// Health check route
router.get('/health', async (req, res) => {
    const isHealthy = await prismaService_1.default.isHealthy();
    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'Server is healthy' : 'Database connection failed',
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'disconnected',
    });
});
// API info route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Karma API - Family Group Fund Management System',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
        },
    });
});
// Mount route modules
router.use('/users', Users_1.default);
// Future routes (commented for now)
// router.use('/groups', groupRoutes);
// router.use('/members', memberRoutes);
// router.use('/deposits', depositRoutes);
// router.use('/loans', loanRoutes);
// router.use('/expenses', expenseRoutes);
exports.default = router;
