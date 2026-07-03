import axiosInstance from "../../api/apiInstance";

export interface DashboardActivity {
    id: string;
    type: 'deposit' | 'loan' | 'fine' | 'expense' | 'adjustment' | 'unknown';
    user: string;
    amount: number;
    date: string;
    status: string;
}

export interface GroupDashboardStats {
    totalMembers: number;
    totalGroupFund: number;
    availableBalance: number;
    totalDeposits: number;
    activeLoans: number;
    totalServiceCharges: number;
    recentActivity: DashboardActivity[];
}

export interface MemberDashboardStats {
    totalDeposit: number;
    activeLoan: number;
    pendingFines: number;
    nextInstallment: string | null;
    totalFinesPaid: number;
    amountPerHead: number;
}

export const DashboardApi = {
    getGroupStats: async (groupId: string = 'default') => {
        const response = await axiosInstance.get(`/dashboard/${groupId}`);
        return response.data?.data as GroupDashboardStats;
    },

    getMemberStats: async (groupId: string = 'default', memberId: string = 'default') => {
        const response = await axiosInstance.get(`/dashboard/${groupId}/member/${memberId}`);
        return response.data?.data as MemberDashboardStats;
    }
};
