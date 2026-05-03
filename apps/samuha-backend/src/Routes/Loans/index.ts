import { Router } from 'express';
import loanController from '../../Controllers/Loan/index';

const router = Router();

// Loan Routes
router.post('/', loanController.create);
router.get('/', loanController.getAll);
router.get('/:id', loanController.getById);
router.put('/:id', loanController.update);
router.delete('/:id', loanController.delete);

// Repayment Routes
router.get('/:id/repayments', loanController.getRepayments);
router.put('/repayments/:repaymentId', loanController.updateRepayment);

export default router;
