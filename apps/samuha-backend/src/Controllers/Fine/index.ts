import { Request, Response, NextFunction } from 'express';
import fineService from '../../Services/Fine/fine.service';

class FineController {
    /**
     * @route   POST /api/fines/run-engine
     * @desc    Manually trigger the fine calculation engine
     * @access  Admin
     */
    async runEngine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const results = await fineService.runFineEngine();
            res.status(200).json({
                success: true,
                message: 'Fine engine executed successfully',
                data: results,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/fines/group/:groupId
     * @desc    Get all fines for a group
     * @access  Admin
     */
    async getByGroup(req: Request<{ groupId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const fines = await fineService.getByGroup(req.params.groupId);
            res.status(200).json({
                success: true,
                message: 'Fines retrieved successfully',
                data: fines,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/fines/member/:memberId
     * @desc    Get all fines for a member
     * @access  Private
     */
    async getByMember(req: Request<{ memberId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const fines = await fineService.getByMember(req.params.memberId);
            res.status(200).json({
                success: true,
                message: 'Member fines retrieved successfully',
                data: fines,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/fines/:fineId/pay
     * @desc    Mark a fine as paid
     * @access  Admin
     */
    async markPaid(req: Request<{ fineId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentMode, virtualDetails } = req.body;
            let finalFineId = req.params.fineId;
            
            // If it's a virtual fine, create it first
            if (finalFineId === 'virtual-deposit-fine' && virtualDetails) {
                const newFine = await fineService.createVirtualFine(virtualDetails);
                finalFineId = newFine.id;
            }

            const fine = await fineService.markPaid(finalFineId, paymentMode || 'CASH');
            res.status(200).json({
                success: true,
                message: 'Fine marked as paid',
                data: fine,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/fines
     * @desc    Create a fine manually
     * @access  Admin
     */
    async createFine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const fine = await fineService.createManualFine(req.body);
            res.status(201).json({
                success: true,
                message: 'Fine created successfully',
                data: fine,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/fines/:fineId/waive
     * @desc    Waive a fine
     * @access  Admin
     */
    async waive(req: Request<{ fineId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { waivedBy, reason } = req.body;
            const fine = await fineService.waive(req.params.fineId, waivedBy, reason);
            res.status(200).json({
                success: true,
                message: 'Fine waived',
                data: fine,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new FineController();
