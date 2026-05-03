import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    DollarSign,
    Link as LinkIcon,
    Wallet
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    FormInput,
    Form,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    Typography
} from '@sujan77/ui-components';

export const payEmiSchema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    wallet: z.enum(['BANK', 'ESEWA', 'KHALTI']),
    voucherUrl: z.string().url('Must be a valid URL').or(z.literal('')),
});

export type PayEmiFormData = z.infer<typeof payEmiSchema>;

interface PayEmiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { paidAmount: number, paymentMode: string, notes: string }) => void;
    expectedAmount: number;
}

export function PayEmiModal({ isOpen, onClose, onSubmit, expectedAmount }: PayEmiModalProps) {
    const form = useForm<PayEmiFormData>({
        resolver: zodResolver(payEmiSchema),
        defaultValues: {
            amount: expectedAmount.toString(),
            wallet: 'BANK',
            voucherUrl: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                amount: expectedAmount.toString(),
                wallet: 'BANK',
                voucherUrl: '',
            });
        }
    }, [isOpen, expectedAmount, form]);

    const handleFormSubmit = (values: PayEmiFormData) => {
        const paymentMode = values.wallet === 'BANK' ? 'BANK_TRANSFER' : 'WALLET';
        const notes = `Payment via ${values.wallet}${values.voucherUrl ? ` | Receipt: ${values.voucherUrl}` : ''}`;
        
        onSubmit({
            paidAmount: parseFloat(values.amount),
            paymentMode,
            notes
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-primary/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">Pay Installment</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Submit your EMI payment details for tracking.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Amount (NPR)</Label>
                                    </div>
                                    <FormInput
                                        name="amount"
                                        type="number"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                    <Typography variant="small" className="text-[10px] text-muted-foreground ml-1 mt-1 block">
                                        Expected EMI Amount is NPR {expectedAmount.toLocaleString()}
                                    </Typography>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Wallet className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Payment Method</Label>
                                    </div>
                                    <Select
                                        value={form.watch('wallet')}
                                        onValueChange={(val: 'BANK' | 'ESEWA' | 'KHALTI') => form.setValue('wallet', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                                            <SelectItem value="ESEWA">eSewa</SelectItem>
                                            <SelectItem value="KHALTI">Khalti Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Receipt Link (Optional)</Label>
                                    </div>
                                    <FormInput
                                        name="voucherUrl"
                                        placeholder="Add a link to the screenshot"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>
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
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg"
                                >
                                    Submit Payment
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
