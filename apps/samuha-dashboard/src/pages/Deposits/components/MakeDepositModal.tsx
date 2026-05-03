import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Calendar,
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
import { useGlobalStore } from '../../../store/store';
import { makeDepositSchema, type MakeDepositFormData, type DepositPostData } from '../types';

interface MakeDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DepositPostData) => void;
}

export function MakeDepositModal({ isOpen, onClose, onSubmit }: MakeDepositModalProps) {
    const { activeMemberId, activeGroupId } = useGlobalStore();
    console.log({ activeGroupId }, { activeMemberId })

    // Generate next 6 months for dropdown
    const [monthOptions, setMonthOptions] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        const options = [];
        const date = new Date();
        for (let i = 0; i < 6; i++) {
            const tempDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
            const value = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`;
            const label = tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            options.push({ label, value });
        }
        setMonthOptions(options);
    }, []);

    const form = useForm<MakeDepositFormData>({
        resolver: zodResolver(makeDepositSchema),
        defaultValues: {
            monthYear: new Date().toISOString().slice(0, 7),
            amount: '1000',
            wallet: 'BANK',
            voucherUrl: '',
        }
    });

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            form.reset({
                monthYear: new Date().toISOString().slice(0, 7),
                amount: '1000',
                wallet: 'BANK',
                voucherUrl: '',
            });
        }
    }, [isOpen, form]);

    const handleFormSubmit = (values: MakeDepositFormData) => {
        if (!activeMemberId || !activeGroupId) {
            console.error("Missing active member or group ID", { activeMemberId, activeGroupId });
            return;
        }

        // Map Wallet to Backend PaymentMode
        const paymentMode = values.wallet === 'BANK' ? 'BANK_TRANSFER' : 'WALLET';
        const notes = values.wallet !== 'BANK' ? `Payment via ${values.wallet}` : '';

        // Create the post data
        const postData: DepositPostData = {
            groupId: activeGroupId,
            memberId: activeMemberId,
            monthYear: values.monthYear,
            amount: values.amount,
            dueDate: new Date(values.monthYear + '-28'), // Default due date to end of the selected month
            status: 'PENDING', // Will be confirmed by admin
            paymentMode,
            paidDate: new Date(),
            voucherUrl: values.voucherUrl || '',
            notes
        };

        onSubmit(postData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-primary/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">Make Deposit</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Submit your monthly savings contribution.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Deposit Month</Label>
                                    </div>
                                    <Select
                                        value={form.watch('monthYear')}
                                        onValueChange={(val) => form.setValue('monthYear', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5">
                                            <SelectValue placeholder="Select Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.monthYear && (
                                        <Typography variant="small" className="text-destructive text-[10px] font-bold mt-1 block">
                                            {form.formState.errors.monthYear.message}
                                        </Typography>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Amount (NPR)</Label>
                                    </div>
                                    <FormInput
                                        name="amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5"
                                    />
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
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BANK">Bank Deposit/Transfer</SelectItem>
                                            <SelectItem value="ESEWA">eSewa</SelectItem>
                                            <SelectItem value="KHALTI">Khalti Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Receipt / Voucher Link</Label>
                                    </div>
                                    <FormInput
                                        name="voucherUrl"
                                        placeholder="Link to your screenshot or receipt"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Typography variant="small" className="text-[10px] text-muted-foreground ml-1 mt-1 block">
                                        Please upload your receipt to a cloud storage (like Google Drive) and paste the public link here.
                                    </Typography>
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
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
                                    Submit Deposit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
