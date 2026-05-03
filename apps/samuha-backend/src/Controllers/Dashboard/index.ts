import { Request, Response, NextFunction } from 'express';
import dashboardService from '../../Services/Dashboard/dashboard.service';

class DashboardController {
    /**
     * @route   GET /api/dashboard/:groupId
     * @desc    Get aggregate group stats and recent activity
     * @access  Private
     */
    async getGroupDashboard(req: Request<{ groupId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId } = req.params;
            // Support default groupId resolution similar to Rules
            let resolvedGroupId = groupId;
            if (groupId === 'default') {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();
                const firstGroup = await prisma.group.findFirst({ select: { id: true } });
                if (firstGroup) {
                    resolvedGroupId = firstGroup.id;
                }
            }

            const stats = await dashboardService.getGroupStats(resolvedGroupId);

            res.status(200).json({
                success: true,
                message: 'Dashboard group stats retrieved successfully',
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/dashboard/:groupId/member/:memberId
     * @desc    Get aggregate personal member stats
     * @access  Private
     */
    async getMemberDashboard(req: Request<{ groupId: string, memberId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId, memberId } = req.params;
            
            let resolvedGroupId = groupId;
            if (groupId === 'default') {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();
                const firstGroup = await prisma.group.findFirst({ select: { id: true } });
                if (firstGroup) {
                    resolvedGroupId = firstGroup.id;
                }
            }

            let resolvedMemberId = memberId;
            if (memberId === 'default') {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();
                const firstMember = await prisma.member.findFirst({ where: { groupId: resolvedGroupId }, select: { id: true } });
                if (firstMember) {
                    resolvedMemberId = firstMember.id;
                }
            }

            const stats = await dashboardService.getMemberStats(resolvedGroupId, resolvedMemberId);

            res.status(200).json({
                success: true,
                message: 'Dashboard member stats retrieved successfully',
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DashboardController();
