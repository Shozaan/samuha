import { Router } from 'express';
import dashboardController from '../../Controllers/Dashboard';

const router = Router();

router.get('/:groupId', dashboardController.getGroupDashboard);
router.get('/:groupId/member/:memberId', dashboardController.getMemberDashboard);

export default router;
