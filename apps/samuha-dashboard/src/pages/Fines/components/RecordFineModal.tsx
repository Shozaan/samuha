import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Typography,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sujan77/ui-components';
import { useGroupMembers } from '../../Members/hooks/useMembers';
import { useGlobalStore } from '../../../store/store';
import { useCreateFine } from '../hooks/useFines';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    memberId: z.string().min(1, 'Member is required'),
    amount: z.string().min(1, 'Amount is required'),
    fineType: z.enum(['LATE_DEPOSIT', 'LATE_EMI', 'OTHER']),
    reason: z.string().min(1, 'Reason is required'),
    status: z.enum(['PENDING', 'PAID']),
    paymentMode: z.string().optional(),
    notes: z.string().optional(),
});

interface RecordFineModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RecordFineModal: React.FC<RecordFineModalProps> = ({ isOpen, onClose }) => {
    const { activeGroupId } = useGlobalStore();
    const { data: membersRes, isLoading: isLoadingMembers } = useGroupMembers(activeGroupId || '');
    const createFine = useCreateFine();

    const members = membersRes?.data || [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            memberId: '',
            amount: '',
            fineType: 'OTHER',
            reason: '',
            status: 'PAID',
            paymentMode: 'CASH',
        },
    });

    const status = form.watch('status');

    useEffect(() => {
        if (!isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createFine.mutate({
            ...values,
            amount: parseFloat(values.amount),
        }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Record Fine Payment</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="memberId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {members.map((member: any) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.user?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (NPR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fineType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LATE_DEPOSIT">Late Deposit</SelectItem>
                                                <SelectItem value="LATE_EMI">Late EMI</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Reason for fine" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="PAID">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {status === 'PAID' && (
                                <FormField
                                    control={form.control}
                                    name="paymentMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mode</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Mode" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="WALLET">Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Additional notes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={createFine.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createFine.isPending}>
                                {createFine.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Fine
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
