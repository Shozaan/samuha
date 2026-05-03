import { Prisma, Deposit, DepositStatus } from '@prisma/client';
import prismaService from "../prismaService";
import activityService from '../Activity/activity.service';

interface Actor { id: string; name: string; role: string; }

class DepositService {
    private prisma = prismaService.prisma;

    async create(data: Prisma.DepositCreateInput, actor?: Actor): Promise<Deposit> {
        const deposit = await this.prisma.deposit.create({ data });

        if (actor) {
            await activityService.create({
                group: { connect: { id: deposit.groupId } },
                activityType: 'CREATE',
                entityType: 'DEPOSIT',
                entityId: deposit.id,
                actorId: actor.id,
                actorName: actor.name,
                actorRole: actor.role as any,
                action: 'Created deposit',
                description: `${actor.name} submitted a deposit for ${deposit.monthYear}`,
            });
        }

        return deposit;
    }

    async getAll(options: {
        page?: number;
        limit?: number;
        groupId?: string;
        memberId?: string;
        status?: DepositStatus;
        monthYear?: string;
    } = {}) {
        const { page = 1, limit = 10, groupId, memberId, status, monthYear } = options;
        const skip = (page - 1) * limit;
        const where: Prisma.DepositWhereInput = {};
        if (groupId) where.groupId = groupId;
        if (memberId) where.memberId = memberId;
        if (status) where.status = status;
        if (monthYear) where.monthYear = monthYear;

        const [deposits, total] = await Promise.all([
            this.prisma.deposit.findMany({
                where, skip, take: limit,
                orderBy: { monthYear: 'desc' },
                include: {
                    member: { select: { id: true, userId: true, role: true } },
                    group: { select: { name: true } }
                }
            }),
            this.prisma.deposit.count({ where }),
        ]);

        return {
            data: deposits,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getById(id: string): Promise<Deposit | null> {
        return await this.prisma.deposit.findUnique({
            where: { id },
            include: { group: true, member: true, fine: true, transaction: true, receipt: true }
        });
    }

    async update(id: string, data: Prisma.DepositUpdateInput, actor?: Actor): Promise<Deposit> {
        const deposit = await this.prisma.deposit.update({ where: { id }, data });

        if (actor) {
            const isConfirm = data.status === 'PAID' || data.confirmedAt;
            await activityService.create({
                group: { connect: { id: deposit.groupId } },
                activityType: isConfirm ? 'CONFIRM' : 'UPDATE',
                entityType: 'DEPOSIT',
                entityId: deposit.id,
                actorId: actor.id,
                actorName: actor.name,
                actorRole: actor.role as any,
                action: isConfirm ? 'Confirmed deposit' : 'Updated deposit',
                description: isConfirm
                    ? `${actor.name} confirmed deposit for ${deposit.monthYear}`
                    : `${actor.name} updated deposit for ${deposit.monthYear}`,
            });
        }

        return deposit;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.deposit.delete({ where: { id } });
    }
}

export default new DepositService();
