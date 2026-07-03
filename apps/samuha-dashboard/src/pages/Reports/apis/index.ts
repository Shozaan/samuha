import apiInstance from '../../../api/apiInstance';

export interface MonthlyLedger {
    monthYear: string;
    totalDeposits: number;
    totalLoans: number;
    totalRepayments: number;
    totalFines: number;
}

export interface MonthlyReportResponse {
    success: boolean;
    data: MonthlyLedger[];
    meta: { year: number; availableYears: number[] };
}

export const reportsApi = {
    getMonthly: async (groupId: string, year?: number): Promise<MonthlyReportResponse> => {
        const res = await apiInstance.get('/reports/monthly', { params: { groupId, year } });
        return res.data;
    },
};
