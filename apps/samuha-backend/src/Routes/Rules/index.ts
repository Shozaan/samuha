import { Router } from 'express';
import ruleController from '../../Controllers/Rule';

const router = Router();

router.post('/', ruleController.create);
router.get('/', ruleController.getAll);
router.get('/active/:groupId', ruleController.getActive);
router.post('/upsert/:groupId', ruleController.upsert);
router.get('/:id', ruleController.getById);
router.put('/:id', ruleController.update);
router.delete('/:id', ruleController.delete);

export default router;
