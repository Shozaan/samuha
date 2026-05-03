import { Request, Response, NextFunction } from 'express';
import ruleService from '../../Services/Rule/rule.service';
import prismaService from '../../Services/prismaService';

class RuleController {
    /**
     * @route   POST /api/rules
     * @desc    Create a new rule
     * @access  Private
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rule = await ruleService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Rule created successfully',
                data: rule,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/rules
     * @desc    Get all rules
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, groupId, ruleType } = req.query;

            const result = await ruleService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                groupId: groupId as string,
                ruleType: ruleType as any
            });

            res.status(200).json({
                success: true,
                message: 'Rules retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/rules/active/:groupId
     * @desc    Get active rules for a group
     * @access  Private
     */
    async getActive(req: Request<{ groupId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId } = req.params;
            const rules = await ruleService.getActiveRules(groupId);

            res.status(200).json({
                success: true,
                message: 'Active rules retrieved successfully',
                data: rules,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/rules/upsert/:groupId
     * @desc    Create or update the active rule for a group (upsert)
     * @access  Private
     */
    async upsert(req: Request<{ groupId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId } = req.params;
            const b = req.body;

            // Parse helpers — form sends strings, Prisma needs numbers
            const toNum = (v: string | undefined) =>
                v !== undefined && v !== '' ? parseFloat(v.replace(/,/g, '')) : undefined;
            const toInt = (v: string | undefined) =>
                v !== undefined && v !== '' ? parseInt(v, 10) : undefined;

            // Map frontend form field names → Prisma schema column names
            const mappedData = {
                registrationFee:           toNum(b.membershipFee),
                monthlyDepositAmount:      toNum(b.mandatoryDeposit),
                depositDueDay:             toInt(b.depositDeadline),
                loanInterestRate:          toNum(b.interestRate),
                allowedLoanTenures:        b.allowedLoanTenures,
                loanProcessingFeePercent:  toNum(b.loanProcessingFee),
                minDepositMonths:          toInt(b.minDepositRequirement),
                savingsToLoanRatio:        toNum(b.savingsToLoanRatio),
                emiPaymentDay:             toInt(b.loanEmiPaymentDate),
                lateDepositFineAmount:     toNum(b.lateDepositFine),
                lateEmiPenaltyPercent:     toNum(b.lateEmiPenalty),
                loanDefaultPenaltyPercent: toNum(b.loanDefaultPenaltyRate),
            };

            // Resolve 'default' to the first real group in the DB
            let resolvedGroupId = groupId;
            if (groupId === 'default') {
                const firstGroup = await prismaService.prisma.group.findFirst();
                if (!firstGroup) {
                    res.status(404).json({ success: false, message: 'No group found in the system.' });
                    return;
                }
                resolvedGroupId = firstGroup.id;
            }

            const existingRules = await ruleService.getActiveRules(resolvedGroupId);
            const existing = existingRules[0];

            let result;
            if (existing) {
                result = await ruleService.update(existing.id, mappedData);
            } else {
                result = await ruleService.create({
                    ...mappedData,
                    group: { connect: { id: resolvedGroupId } },
                    ruleType: 'GENERAL',
                    version: 1,
                    effectiveFrom: new Date(),
                    changedBy: b.changedBy ?? 'admin',
                    isActive: true,
                });
            }

            res.status(200).json({
                success: true,
                message: existing ? 'Rule updated successfully' : 'Rule created successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/rules/:id
     * @desc    Get rule by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const rule = await ruleService.getById(id);

            if (!rule) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Rule retrieved successfully',
                data: rule,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/rules/:id
     * @desc    Update rule
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await ruleService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }

            const updated = await ruleService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Rule updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/rules/:id
     * @desc    Delete rule
     * @access  Private
     */
    async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const existing = await ruleService.getById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Rule not found',
                });
                return;
            }

            await ruleService.delete(id);

            res.status(200).json({
                success: true,
                message: 'Rule deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RuleController();
