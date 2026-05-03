import { Router } from 'express';
import memberController from '../../Controllers/Member';

const router = Router();

router.post('/', memberController.assign);
router.get('/', memberController.getAll);
router.get('/:id', memberController.getById);
router.put('/:id', memberController.update);
router.delete('/:id', memberController.remove);

export default router;
