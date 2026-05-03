import apiInstance from '../../../api/apiInstance';

export interface GroupMemberResponse {
    id: string;
    userId: string;
    groupId: string;
    relation?: string;
    role: string;
    status: string;
    joinDate: string;
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        userName: string;
    };
    group: {
        id: string;
        name: string;
    };
    _count?: {
        deposits: number;
        loans: number;
    };
    financialSummary?: {
        totalDeposits: number;
        activeLoanPrincipal: number;
        totalLoansPrincipal: number;
        totalRepaid: number;
        repaymentProgress: number;
    };
}

export interface PaginatedMembersResponse {
    success: boolean;
    message: string;
    data: GroupMemberResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const membersApi = {
    // Get members of specific groups (filtered by groupId)
    getGroupMembers: async (params: {
        groupId?: string;
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<PaginatedMembersResponse> => {
        const response = await apiInstance.get('/members', { params });
        return response.data;
    },

    // Get my own memberships (to find my groups)
    getMyMemberships: async (userId: string): Promise<PaginatedMembersResponse> => {
        const response = await apiInstance.get('/members', { params: { userId } });
        return response.data;
    },

    // Get specific member by ID
    getMemberById: async (id: string): Promise<{ success: boolean; data: GroupMemberResponse }> => {
        const response = await apiInstance.get(`/members/${id}`);
        return response.data;
    }
};
