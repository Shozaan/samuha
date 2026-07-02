// src/routes/index.ts

import { Router, Request, Response } from 'express';
import userRoutes from '../Routes/Users';
import depositRoutes from '../Routes/Deposits';
import authRoutes from '../Routes/Authenticate';
import groupRoutes from '../Routes/Groups';
import memberRoutes from '../Routes/Members';
import loanRoutes from '../Routes/Loans';
import fineRoutes from '../Routes/Fines';
import activityRoutes from '../Routes/Activities';
import ruleRoutes from '../Routes/Rules';
import dashboardRoutes from '../Routes/Dashboard';
import reportRoutes from '../Routes/Reports';
import expenseRoutes from '../Routes/Expenses';
import prismaService from '../Services/prismaService';

const router = Router();

/**
 * API Routes
 * Base URL: /api
 */

// Health check route
router.get('/health', async (req: Request, res: Response) => {
    const isHealthy = await prismaService.isHealthy();

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'Server is healthy' : 'Database connection failed',
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'disconnected',
    });
});

// API info route
router.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Karma API - Family Group Fund Management System',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
            deposits: '/api/deposits',
            authenticate: '/api/authenticate',
            groups: '/api/groups',
            members: '/api/members',
            loans: '/api/loans',
            fines: '/api/fines',
            activities: '/api/activities',
            rules: '/api/rules',
            dashboard: '/api/dashboard',
        },
    });
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/deposits', depositRoutes);
router.use('/authenticate', authRoutes);
router.use('/groups', groupRoutes);
router.use('/members', memberRoutes);
router.use('/loans', loanRoutes);
router.use('/fines', fineRoutes);
router.use('/activities', activityRoutes);
router.use('/rules', ruleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/expenses', expenseRoutes);

export default router;