import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../apis';

export const useMonthlyLedger = (groupId: string, year?: number) =>
    useQuery({
        queryKey: ['reports', 'monthly', groupId, year],
        queryFn: () => reportsApi.getMonthly(groupId, year),
        enabled: !!groupId,
    });
