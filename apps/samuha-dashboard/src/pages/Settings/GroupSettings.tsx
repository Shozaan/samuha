import React, { useState, useEffect } from 'react';
import {
    Wallet,
    HandCoins,
    AlertCircle,
    Save,
    RotateCcw,
    History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Typography,
    Button,
    FormInput,
    Form,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    toast
} from '@sujan77/ui-components';
import { SettingsApi, type GroupRulesPayload } from './settings.api';
import { useGlobalStore } from '../../store/store';

const groupSettingsSchema = z.object({
    membershipFee: z.string(),
    mandatoryDeposit: z.string(),
    depositDeadline: z.string(),
    interestRate: z.string(),
    allowedLoanTenures: z.string(),
    loanProcessingFee: z.string(),
    minDepositRequirement: z.string(),
    savingsToLoanRatio: z.string(),
    loanEmiPaymentDate: z.string(),
    lateDepositFine: z.string(),
    lateEmiPenalty: z.string(),
    loanDefaultPenaltyRate: z.string()
});

type GroupSettingsValues = z.infer<typeof groupSettingsSchema>;

export default function GroupSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { activeGroupId } = useGlobalStore();

    const { handleSubmit, setValue, watch, reset, ...form } = useForm<GroupSettingsValues>({
        resolver: zodResolver(groupSettingsSchema),
        defaultValues: {
            membershipFee: "500",
            mandatoryDeposit: "2,000",
            depositDeadline: "15",
            interestRate: "12",
            allowedLoanTenures: "3, 6, 12",
            loanProcessingFee: "1",
            minDepositRequirement: "3",
            savingsToLoanRatio: "3",
            loanEmiPaymentDate: "10",
            lateDepositFine: "500",
            lateEmiPenalty: "2",
            loanDefaultPenaltyRate: "5"
        }
    });

    const depositDeadlineWatcher = watch('depositDeadline');
    const loanEmiPaymentDateWatcher = watch('loanEmiPaymentDate');

    useEffect(() => {
        async function fetchRules() {
            try {
                const result = await SettingsApi.getGroupRules(activeGroupId);
                const rules = Array.isArray(result?.data) ? result.data[0] : result?.data;
                if (rules) {
                    reset({
                        membershipFee: rules.registrationFee?.toString() || "",
                        mandatoryDeposit: rules.monthlyDepositAmount?.toString() || "",
                        depositDeadline: rules.depositDueDay?.toString() || "",
                        interestRate: rules.loanInterestRate?.toString() || "",
                        allowedLoanTenures: rules.allowedLoanTenures?.toString() || "",
                        loanProcessingFee: rules.loanProcessingFeePercent?.toString() || "",
                        minDepositRequirement: rules.minDepositMonths?.toString() || "",
                        savingsToLoanRatio: rules.savingsToLoanRatio?.toString() || "",
                        loanEmiPaymentDate: rules.emiPaymentDay?.toString() || "",
                        lateDepositFine: rules.lateDepositFineAmount?.toString() || "",
                        lateEmiPenalty: rules.lateEmiPenaltyPercent?.toString() || "",
                        loanDefaultPenaltyRate: rules.loanDefaultPenaltyPercent?.toString() || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch group rules");
            } finally {
                setIsLoading(false);
            }
        }
        fetchRules();
    }, [reset]);

    async function onSubmit(values: GroupSettingsValues) {
        setIsSaving(true);
        try {
            await SettingsApi.upsertGroupRules(activeGroupId || 'default', values as GroupRulesPayload);
            toast.success("Group settings updated", {
                description: "New configuration has been saved and broadcasted."
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings", {
                description: "There was an error updating group settings."
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading group configurations...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Group Configuration</Typography>
                    <Typography variant="muted">Define rules, interest rates and mandatory savings amounts.</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/settings/admin">
                        <Button variant="outline" className="border-border text-foreground font-bold rounded-xl px-6">
                            Admin Management
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <Form {...form} watch={watch} setValue={setValue} reset={reset} handleSubmit={handleSubmit}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Card className="border-border bg-card shadow-sm">
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <Typography variant="h3" className="text-xl font-bold text-foreground">Savings & Membership Rules</Typography>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                        <div className="space-y-2">
                                            <FormInput
                                                name="membershipFee"
                                                label="Registration Fee (NPR)"
                                                className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <FormInput
                                                name="mandatoryDeposit"
                                                label="Mandatory Monthly Deposit (NPR)"
                                                className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-foreground/70 ml-1">Deposit Deadline Date</Label>
                                            <Select onValueChange={(val) => setValue('depositDeadline', val)} value={depositDeadlineWatcher}>
                                                <SelectTrigger className="w-full h-12 rounded-xl border-border bg-muted/30">
                                                    <SelectValue placeholder="Select Deadline" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15th of the month</SelectItem>
                                                    <SelectItem value="10">10th of the month</SelectItem>
                                                    <SelectItem value="7">7th of the month</SelectItem>
                                                    <SelectItem value="1">1st of the month</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-8 pt-8 border-t border-border">
                                        <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                                            <HandCoins className="w-6 h-6" />
                                        </div>
                                        <Typography variant="h3" className="text-xl font-bold text-foreground">Loan & Interest Policy</Typography>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                                        <FormInput
                                            name="interestRate"
                                            label="Annual Interest Rate (%)"
                                            className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                        />
                                        <FormInput
                                            name="allowedLoanTenures"
                                            label="Loan Tenures (Months)"
                                            className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                            placeholder="e.g., 3, 6, 12"
                                        />
                                        <FormInput
                                            name="loanProcessingFee"
                                            label="Loan Processing Fee (%)"
                                            className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <div className="space-y-1">
                                            <FormInput
                                                name="minDepositRequirement"
                                                label="Min Deposit Requirement (Months)"
                                                className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                            />
                                            <Typography variant="small" className="text-[10px] text-muted-foreground mt-1 ml-1 leading-tight font-medium uppercase tracking-tighter">Deposit duration before loan eligibility</Typography>
                                        </div>
                                        <div className="space-y-1">
                                            <FormInput
                                                name="savingsToLoanRatio"
                                                label="Savings to Loan Ratio (x)"
                                                className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                            />
                                            <Typography variant="small" className="text-[10px] text-muted-foreground mt-1 ml-1 leading-tight font-medium uppercase tracking-tighter">Multiplier of deposit for max loan amount</Typography>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-8 pt-8 border-t border-border">
                                        <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <Typography variant="h3" className="text-xl font-bold text-foreground">Payment Dates & Penalties</Typography>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-foreground/70 ml-1">Loan EMI Payment Date</Label>
                                            <Select onValueChange={(val) => setValue('loanEmiPaymentDate', val)} value={loanEmiPaymentDateWatcher}>
                                                <SelectTrigger className="w-full h-12 rounded-xl border-border bg-muted/30">
                                                    <SelectValue placeholder="Select Date" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="20">20th of the month</SelectItem>
                                                    <SelectItem value="15">15th of the month</SelectItem>
                                                    <SelectItem value="10">10th of the month</SelectItem>
                                                    <SelectItem value="5">5th of the month</SelectItem>
                                                    <SelectItem value="1">1st of the month</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <FormInput
                                                name="lateDepositFine"
                                                label="Late Deposit Fine (Fixed NPR)"
                                                className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormInput
                                            name="lateEmiPenalty"
                                            label="Late EMI Penalty (% per Week)"
                                            className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                        />
                                        <FormInput
                                            name="loanDefaultPenaltyRate"
                                            label="Loan Default Rate (% increase/month)"
                                            className="rounded-xl border-border bg-muted/30 h-12 px-4"
                                            placeholder="e.g., 5"
                                        />
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-border flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="px-8 h-12 rounded-xl border-border text-foreground font-bold flex items-center gap-2"
                                            onClick={() => reset()}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Discard Changes
                                        </Button>
                                        <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                                            <Save className="w-4 h-4" />
                                            {isSaving ? "Updating Rules..." : "Update Group Rules"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </Form>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-primary/20 bg-primary/5 shadow-none">
                        <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Audit Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 space-y-4">
                            {[
                                { user: 'Admin', act: 'Changed interest rate from 10% to 12%', date: '2 weeks ago' },
                                { user: 'Admin', act: 'Updated late fine from 300 to 500', date: '1 month ago' },
                                { user: 'Systems', act: 'New fiscal year started', date: '2 months ago' }
                            ].map((log, i) => (
                                <div key={i} className="text-xs group">
                                    <Typography variant="small" className="text-foreground/70 font-bold block mb-1 group-hover:text-primary transition-colors">{log.act}</Typography>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{log.user} • {log.date}</Typography>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full mt-4 text-[10px] font-black text-primary uppercase tracking-widest h-10 border border-primary/10 hover:bg-primary/5">View Full History</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card p-6 border-dashed">
                        <Typography variant="small" className="font-bold text-foreground mb-2 block">Transparency Note</Typography>
                        <Typography variant="small" className="text-xs text-muted-foreground leading-relaxed italic">
                            All changes to group rules are broadcasted to all members via the activity feed and sent as SMS notifications to ensure everyone is aware of the new policies.
                        </Typography>
                    </Card>
                </div>
            </div>
        </div>
    );
}
