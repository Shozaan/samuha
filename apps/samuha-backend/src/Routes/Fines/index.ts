import { Router } from 'express';
import fineController from '../../Controllers/Fine';

const router = Router();

// Engine
router.post('/run-engine', fineController.runEngine.bind(fineController));

// Group / Member fines
router.get('/group/:groupId', fineController.getByGroup.bind(fineController));
router.get('/member/:memberId', fineController.getByMember.bind(fineController));
router.post('/', fineController.createFine.bind(fineController));

// Actions
router.put('/:fineId/pay', fineController.markPaid.bind(fineController));
router.put('/:fineId/waive', fineController.waive.bind(fineController));

export default router;
