import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finesApi } from '../apis';
import { useGlobalStore } from '../../../store/store';

const useActor = () => {
    const { user, activeMemberId, role } = useGlobalStore();
    if (!activeMemberId || !user?.name) return undefined;
    return { id: activeMemberId, name: user.name, role: role || 'MEMBER' };
};

export const useFinesByGroup = (groupId: string) =>
    useQuery({
        queryKey: ['fines', 'group', groupId],
        queryFn: () => finesApi.getByGroup(groupId),
        enabled: !!groupId,
    });

export const useFinesByMember = (memberId: string) =>
    useQuery({
        queryKey: ['fines', 'member', memberId],
        queryFn: () => finesApi.getByMember(memberId),
        enabled: !!memberId,
    });

export const useCreateFine = () => {
    const qc = useQueryClient();
    const actor = useActor();
    return useMutation({
        mutationFn: (data: any) => finesApi.create({ ...data, actor }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fines'] });
            qc.invalidateQueries({ queryKey: ['activities'] });
        },
    });
};

export const useMarkFinePaid = () => {
    const qc = useQueryClient();
    const actor = useActor();
    return useMutation({
        mutationFn: ({ fineId, paymentMode, virtualDetails }: { fineId: string; paymentMode: string; virtualDetails?: any }) =>
            finesApi.markPaid(fineId, paymentMode, { ...virtualDetails }, actor),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fines'] });
            qc.invalidateQueries({ queryKey: ['activities'] });
        },
    });
};

export const useWaiveFine = () => {
    const qc = useQueryClient();
    const actor = useActor();
    return useMutation({
        mutationFn: ({ fineId, waivedBy, reason }: { fineId: string; waivedBy: string; reason: string }) =>
            finesApi.waive(fineId, waivedBy, reason, actor),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fines'] });
            qc.invalidateQueries({ queryKey: ['activities'] });
        },
    });
};

export const useRunFineEngine = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => finesApi.runEngine(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['fines'] }),
    });
};
