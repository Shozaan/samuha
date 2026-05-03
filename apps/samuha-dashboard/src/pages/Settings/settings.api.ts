import axiosInstance from "../../api/apiInstance";

export interface GroupRulesPayload {
    membershipFee: string;
    mandatoryDeposit: string;
    depositDeadline: string;
    interestRate: string;
    allowedLoanTenures: string;
    loanProcessingFee: string;
    minDepositRequirement: string;
    savingsToLoanRatio: string;
    loanEmiPaymentDate: string;
    lateDepositFine: string;
    lateEmiPenalty: string;
    loanDefaultPenaltyRate: string;
}

export interface AdminPayload {
    id?: string;
    name: string;
    email: string;
    role: string;
    since?: string;
}

export const SettingsApi = {
    // --- Group Rules ---
    getGroupRules: async (groupId: string = 'default') => {
        const response = await axiosInstance.get(`/rules/active/${groupId}`);
        return response.data;
    },

    updateGroupRules: async (ruleId: string, rules: GroupRulesPayload) => {
        const response = await axiosInstance.put(`/rules/${ruleId}`, rules);
        return response.data;
    },

    upsertGroupRules: async (groupId: string, rules: GroupRulesPayload) => {
        const response = await axiosInstance.post(`/rules/upsert/${groupId}`, rules);
        return response.data;
    },

    // --- Admin Settings ---
    getAdmins: async () => {
        const response = await axiosInstance.get('/admins');
        return response.data as AdminPayload[];
    },

    addAdmin: async (admin: Omit<AdminPayload, 'id'>) => {
        const response = await axiosInstance.post('/admins', admin);
        return response.data;
    },

    removeAdmin: async (adminId: string) => {
        const response = await axiosInstance.delete(`/admins/${adminId}`);
        return response.data;
    }
};
