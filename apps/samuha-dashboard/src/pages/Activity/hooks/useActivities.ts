import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../apis';

export const useActivities = (params: { groupId?: string; limit?: number; page?: number; entityType?: string }) =>
    useQuery({
        queryKey: ['activities', params],
        queryFn: () => activitiesApi.getAll(params),
        enabled: !!params.groupId,
    });
