import { Router } from 'express';
import reportController from '../../Controllers/Report';

const router = Router();

router.get('/monthly', reportController.getMonthly.bind(reportController));
router.get('/', reportController.getAll.bind(reportController));
router.get('/:id', reportController.getById.bind(reportController));
router.post('/', reportController.create.bind(reportController));
router.put('/:id', reportController.update.bind(reportController));
router.delete('/:id', reportController.delete.bind(reportController));

export default router;
