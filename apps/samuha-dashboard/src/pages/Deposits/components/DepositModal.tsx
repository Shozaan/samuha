import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    User,
    Calendar,
    DollarSign,
    CreditCard,
    FileText,
    Link as LinkIcon,
    Shield,
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
} from '@sujan77/ui-components';
import { useUsers } from '../../Users/hooks/useUsers';
import { useGroups } from '../../Groups/hooks/useGroups';
import { depositSchema, type DepositFormData, type DepositPostData } from '../types';



interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DepositPostData) => void;
    initialData?: Partial<DepositFormData> | null;
}

export function DepositModal({ isOpen, onClose, onSubmit, initialData }: DepositModalProps) {
    const { data: membersResponse } = useUsers({ limit: 100 });
    const members = membersResponse?.data || [];

    const { data: groupsResponse } = useGroups({ limit: 100 });
    const groups = groupsResponse?.data || [];

    const form = useForm<DepositFormData>({
        resolver: zodResolver(depositSchema),
        defaultValues: {
            groupId: '',
            memberId: '',
            monthYear: new Date().toISOString().slice(0, 7),
            amount: '1000',
            dueDate: new Date().toISOString().slice(0, 10),
            status: 'PAID',
            paymentMode: 'CASH',
            paidDate: new Date().toISOString().slice(0, 10),
            voucherUrl: '',
            notes: '',
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
                ...form.getValues(),
                ...initialData
            });
        }
    }, [isOpen, initialData, form]);

    const handleFormSubmit = (values: DepositFormData) => {
        const postData: DepositPostData = {
            ...values,
            dueDate: values.dueDate ? new Date(values.dueDate) : new Date(),
            paidDate: values.paidDate ? new Date(values.paidDate) : undefined,
        };
        onSubmit(postData);
        form.reset();
        onClose();
    };

    const statusWatcher = form.watch('status');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-success/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-success/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">Record Deposit</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Record a new monthly deposit for a member.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Shield className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Group</Label>
                                    </div>
                                    <Select
                                        value={form.watch('groupId')}
                                        onValueChange={(val) => form.setValue('groupId', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <User className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Member</Label>
                                    </div>
                                    <Select
                                        value={form.watch('memberId')}
                                        onValueChange={(val) => form.setValue('memberId', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue placeholder="Select Member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Month/Year</Label>
                                    </div>
                                    <FormInput
                                        name="monthYear"
                                        placeholder="YYYY-MM"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Amount (NPR)</Label>
                                    </div>
                                    <FormInput
                                        name="amount"
                                        type="number"
                                        placeholder="1000"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Due Date</Label>
                                    </div>
                                    <FormInput
                                        name="dueDate"
                                        type="date"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Status</Label>
                                    </div>
                                    <Select
                                        value={statusWatcher}
                                        onValueChange={(val: 'PENDING' | 'PAID' | 'LATE' | 'WAIVED') => form.setValue('status', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                            <SelectItem value="LATE">Late</SelectItem>
                                            <SelectItem value="WAIVED">Waived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {statusWatcher === 'PAID' && (
                                    <>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <Label className="text-[10px] font-bold uppercase tracking-wider">Mode</Label>
                                            </div>
                                            <Select
                                                value={form.watch('paymentMode')}
                                                onValueChange={(val: 'CASH' | 'BANK_TRANSFER' | 'CHECK') => form.setValue('paymentMode', val)}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                    <SelectItem value="CHECK">Check</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <Label className="text-[10px] font-bold uppercase tracking-wider">Paid Date</Label>
                                            </div>
                                            <FormInput
                                                name="paidDate"
                                                type="date"
                                                className="h-11 rounded-xl bg-muted/30 border-border"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                                <Label className="text-[10px] font-bold uppercase tracking-wider">Voucher URL</Label>
                                            </div>
                                            <FormInput
                                                name="voucherUrl"
                                                placeholder="https://..."
                                                className="h-11 rounded-xl bg-muted/30 border-border"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                    <FileText className="w-3.5 h-3.5" />
                                    <Label className="text-[10px] font-bold uppercase tracking-wider">Notes</Label>
                                </div>
                                <FormInput
                                    name="notes"
                                    placeholder="Any additional information..."
                                    className="h-11 rounded-xl bg-muted/30 border-border"
                                />
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
                                    className="rounded-xl px-8 font-bold bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20"
                                >
                                    Save Deposit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
