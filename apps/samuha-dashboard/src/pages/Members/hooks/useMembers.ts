import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { membersApi } from '../apis';

export const useMyMemberships = () => {
    const { user } = useAuth();
    const userId = user?.id;

    // Fetch memberships for the logged-in User ID
    const { data: membershipsData, isLoading, isFetched } = useQuery({
        queryKey: ['my-memberships', userId],
        queryFn: () => membersApi.getMyMemberships(userId!),
        enabled: !!userId,
    });

    return {
        memberships: membershipsData?.data || [],
        isLoading: !!userId && isLoading && !isFetched,
        userId,
    };
};

export const useUserMemberships = (userId?: string) => {
    return useQuery({
        queryKey: ['user-memberships', userId],
        queryFn: () => membersApi.getMyMemberships(userId!),
        enabled: !!userId,
    });
};

export const useGroupMembers = (groupId?: string) => {
    return useQuery({
        queryKey: ['group-members', groupId],
        queryFn: () => membersApi.getGroupMembers({ groupId }),
        enabled: !!groupId,
    });
};

export const useMember = (id: string) => {
    return useQuery({
        queryKey: ['members', id],
        queryFn: () => membersApi.getMemberById(id),
        enabled: !!id,
    });
};
