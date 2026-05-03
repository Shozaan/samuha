import { Router } from 'express';
import groupController from '../../Controllers/Group';

const router = Router();

router.post('/', groupController.create);
router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);
router.put('/:id', groupController.update);
router.delete('/:id', groupController.delete);

export default router;
