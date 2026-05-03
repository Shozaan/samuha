import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finesApi } from '../apis';

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

export const useMarkFinePaid = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ fineId, paymentMode }: { fineId: string; paymentMode: string }) =>
            finesApi.markPaid(fineId, paymentMode),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['fines'] }),
    });
};

export const useWaiveFine = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ fineId, waivedBy, reason }: { fineId: string; waivedBy: string; reason: string }) =>
            finesApi.waive(fineId, waivedBy, reason),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['fines'] }),
    });
};

export const useRunFineEngine = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => finesApi.runEngine(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['fines'] }),
    });
};
