import z from "zod";

export const loanRequestSchema = z.object({
    principalAmount: z.string().min(1, "Amount is required"),
    durationMonths: z.string().min(1, "Duration is required"),
    purpose: z.string().optional(),
});

export type LoanRequestFormData = z.infer<typeof loanRequestSchema>;
interface Actor { id: string; name: string; role: string; }

export interface LoanPostData {
    groupId: string;
    memberId: string;
    principalAmount: number;
    durationMonths: number;
    purpose?: string;
    actor?: Actor;
}

export type LoanUpdateData = {
    status?: 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
    approvedById?: string;
    approvedAt?: Date;
    disbursedAt?: Date;
    notes?: string;
    actor?: Actor;
};
