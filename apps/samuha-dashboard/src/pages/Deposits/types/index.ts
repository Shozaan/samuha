import z from "zod";

export const depositSchema = z.object({
    groupId: z.string().min(1, "Group selection is required"),
    memberId: z.string().min(1, "Member selection is required"),
    monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
    amount: z.string().min(1, "Amount is required"),
    dueDate: z.string().min(1, "Due date is required"),
    status: z.enum(['PENDING', 'PAID', 'LATE', 'WAIVED']),
    paymentMode: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'WALLET']).optional(),
    paidDate: z.string().optional(),
    voucherUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    notes: z.string().optional(),
});

export const makeDepositSchema = z.object({
    monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
    amount: z.string().min(1, "Amount is required"),
    wallet: z.enum(['BANK', 'ESEWA', 'KHALTI']),
    voucherUrl: z.string().optional(),
});

export type DepositFormData = z.infer<typeof depositSchema>;
export type MakeDepositFormData = z.infer<typeof makeDepositSchema>;

export interface DepositPostData extends Omit<DepositFormData, 'dueDate' | 'paidDate'> {
    groupId: string;
    dueDate: Date;
    paidDate?: Date;
}

export type DepositUpdateData = Partial<DepositPostData>;