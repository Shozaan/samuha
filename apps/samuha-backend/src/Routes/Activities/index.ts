import { Router } from 'express';
import activityController from '../../Controllers/Activity';

const router = Router();

router.get('/', activityController.getAll.bind(activityController));
router.get('/:id', activityController.getById.bind(activityController));
router.delete('/:id', activityController.delete.bind(activityController));

export default router;
