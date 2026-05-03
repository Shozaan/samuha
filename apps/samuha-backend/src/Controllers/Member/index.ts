import { Request, Response, NextFunction } from 'express';
import memberService from '../../Services/Member/member.service';

class MemberController {
    /**
     * @route   POST /api/members
     * @desc    Assign a user to a group
     * @access  Private (Admin)
     */
    async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, groupId, relation, role, status } = req.body;

            if (!userId || !groupId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID and Group ID are required',
                });
                return;
            }

            // Check if already a member
            const isAlreadyMember = await memberService.isMember(userId, groupId);
            if (isAlreadyMember) {
                res.status(409).json({
                    success: false,
                    message: 'User is already a member of this group',
                });
                return;
            }

            const member = await memberService.assignToGroup({
                userId,
                groupId,
                relation,
                role,
                status,
                addedById: (req as any).user?.id, // Assuming auth middleware attaches user
            });

            res.status(201).json({
                success: true,
                message: 'User assigned to group successfully',
                data: member,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/members
     * @desc    Get members with filtering
     * @access  Private
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { groupId, userId, page, limit, status } = req.query;

            const result = await memberService.getAll({
                groupId: groupId as string,
                userId: userId as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                status: status as any,
            });

            res.status(200).json({
                success: true,
                message: 'Members retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/members/:id
     * @desc    Get member by ID
     * @access  Private
     */
    async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const member = await memberService.getById(id);

            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member record not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Member retrieved successfully',
                data: member,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   PUT /api/members/:id
     * @desc    Update member record
     * @access  Private
     */
    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updated = await memberService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Member updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   DELETE /api/members/:id
     * @desc    Remove user from group
     * @access  Private
     */
    async remove(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await memberService.remove(id);

            res.status(200).json({
                success: true,
                message: 'User removed from group successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MemberController();
