import { Router } from 'express';
import loanController from '../../Controllers/Loan/index';

const router = Router();

// Loan Routes
router.post('/', loanController.create);
router.get('/', loanController.getAll);

// Repayment Routes — static paths must come before dynamic /:id
router.get('/repayments/pending', loanController.getPendingRepayments);
router.get('/repayments/member', loanController.getMemberRepayments);
router.put('/repayments/:repaymentId', loanController.updateRepayment);

// Dynamic loan routes
router.get('/:id', loanController.getById);
router.put('/:id', loanController.update);
router.delete('/:id', loanController.delete);
router.get('/:id/repayments', loanController.getRepayments);

export default router;
