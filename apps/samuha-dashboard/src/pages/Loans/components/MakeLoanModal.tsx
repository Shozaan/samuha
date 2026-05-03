import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark, CalendarDays, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    FormInput,
    Form,
    Label,
    Typography
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../../store/store';
import { loanRequestSchema, type LoanRequestFormData, type LoanPostData } from '../types';

interface MakeLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LoanPostData) => void;
}

export function MakeLoanModal({ isOpen, onClose, onSubmit }: MakeLoanModalProps) {
    const { activeMemberId, activeGroupId } = useGlobalStore();

    const form = useForm<LoanRequestFormData>({
        resolver: zodResolver(loanRequestSchema),
        defaultValues: {
            principalAmount: '',
            durationMonths: '12',
            purpose: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                principalAmount: '',
                durationMonths: '12',
                purpose: '',
            });
        }
    }, [isOpen, form]);

    const handleFormSubmit = (values: LoanRequestFormData) => {
        if (!activeMemberId || !activeGroupId) {
            console.error("Missing active member or group ID", { activeMemberId, activeGroupId });
            return;
        }

        const postData: LoanPostData = {
            groupId: activeGroupId,
            memberId: activeMemberId,
            principalAmount: parseFloat(values.principalAmount),
            durationMonths: parseInt(values.durationMonths, 10),
            purpose: values.purpose,
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
                        <DialogTitle className="text-2xl font-black text-foreground">Request Loan</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Submit your loan request to the administration for approval.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Landmark className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Principal Amount (NPR)</Label>
                                    </div>
                                    <FormInput
                                        name="principalAmount"
                                        type="number"
                                        placeholder="E.g. 50000"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Duration (Months)</Label>
                                    </div>
                                    <FormInput
                                        name="durationMonths"
                                        type="number"
                                        placeholder="E.g. 12"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Typography variant="small" className="text-[10px] text-muted-foreground ml-1 mt-1 block">
                                        EMI and Total Interest will be calculated automatically based on Group Rules.
                                    </Typography>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <FileText className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Purpose / Reason (Optional)</Label>
                                    </div>
                                    <FormInput
                                        name="purpose"
                                        placeholder="Why do you need this loan?"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5"
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
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
