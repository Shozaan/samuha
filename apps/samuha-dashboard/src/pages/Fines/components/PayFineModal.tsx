import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Form,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    Typography
} from '@sujan77/ui-components';
import { useMarkFinePaid } from '../hooks/useFines';

interface PayFineModalProps {
    isOpen: boolean;
    onClose: () => void;
    fine: any;
}

const payFineSchema = z.object({
    wallet: z.enum(['CASH', 'BANK', 'ESEWA', 'KHALTI']),
});

type PayFineFormData = z.infer<typeof payFineSchema>;

export function PayFineModal({ isOpen, onClose, fine }: PayFineModalProps) {
    const markPaid = useMarkFinePaid();

    const form = useForm<PayFineFormData>({
        resolver: zodResolver(payFineSchema),
        defaultValues: {
            wallet: 'CASH',
        }
    });

    const handleFormSubmit = (values: PayFineFormData) => {
        if (!fine) return;
        
        markPaid.mutate({
            fineId: fine.id,
            paymentMode: values.wallet,
            ...(fine.isVirtual && {
                virtualDetails: {
                    memberId: fine.memberId,
                    amount: fine.amount,
                    reason: fine.reason,
                    fineType: fine.fineType,
                    monthYear: fine.monthYear
                }
            })
        });
        
        onClose();
    };

    if (!fine) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-destructive/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-destructive/20 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">Pay Fine</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Clear your outstanding penalty.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    
                    <div className="bg-muted/30 p-4 rounded-xl mb-6 border border-border/50">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <Typography variant="small" className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block mb-1">
                                    Penalty Details
                                </Typography>
                                <Typography variant="p" className="font-bold text-foreground text-sm">
                                    {fine.reason || fine.fineType}
                                </Typography>
                                <Typography variant="h4" className="text-xl font-black text-destructive mt-1">
                                    NPR {Number(fine.amount).toLocaleString()}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                    <Wallet className="w-3.5 h-3.5" />
                                    <Label className="text-[10px] font-bold uppercase tracking-wider">Payment Method</Label>
                                </div>
                                <Select
                                    value={form.watch('wallet')}
                                    onValueChange={(val: 'CASH' | 'BANK' | 'ESEWA' | 'KHALTI') => form.setValue('wallet', val)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-destructive/5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="BANK">Bank Deposit/Transfer</SelectItem>
                                        <SelectItem value="ESEWA">eSewa</SelectItem>
                                        <SelectItem value="KHALTI">Khalti Wallet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="rounded-xl px-6 font-bold text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={markPaid.isPending}
                                    className="rounded-xl px-8 font-bold bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
                                >
                                    {markPaid.isPending ? 'Processing...' : 'Pay Fine'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
