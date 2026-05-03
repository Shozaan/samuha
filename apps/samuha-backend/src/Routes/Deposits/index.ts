import { Router } from 'express';
import depositController from '../../Controllers/Deposit';

const router = Router();

router.post('/', depositController.create);
router.get('/', depositController.getAll);
router.get('/:id', depositController.getById);
router.put('/:id', depositController.update);
router.delete('/:id', depositController.delete);

export default router;
