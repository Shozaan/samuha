import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Upload,
    Plus
} from 'lucide-react';
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

const expenseSchema = z.object({
    category: z.string(),
    amount: z.string().min(1, "Amount is required"),
    paidTo: z.string().min(1, "Merchant name is required"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional()
});

type ExpenseValues = z.infer<typeof expenseSchema>;

export default function NewExpense() {
    const navigate = useNavigate();
    const { handleSubmit, setValue, watch, ...form } = useForm<ExpenseValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            category: "office",
            amount: "",
            paidTo: "",
            date: new Date().toISOString().split('T')[0],
            notes: ""
        }
    });

    const categoryWatcher = watch('category');

    function onSubmit(values: ExpenseValues) {
        toast.success("Expense logged successfully", {
            description: `Expense of NPR ${values.amount} for ${values.category} has been submitted.`
        });
        console.log(values);
        navigate('/expenses');
    }

    return (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <Button
                variant="ghost"
                onClick={() => navigate('/expenses')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground group mb-6"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Expenses
            </Button>

            <Card className="border-border bg-card shadow-lg">
                <CardHeader className="p-8 border-b border-border">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Plus className="w-6 h-6" />
                        </div>
                        Log New Group Expense
                    </CardTitle>
                    <Typography variant="muted">Enter details of any official organizational spending.</Typography>
                </CardHeader>
                <CardContent className="p-8">
                    <Form {...form} watch={watch} setValue={setValue} handleSubmit={handleSubmit}>
                        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/70 ml-1">Expense Category</Label>
                                    <Select
                                        value={categoryWatcher}
                                        onValueChange={(val) => setValue('category', val)}
                                    >
                                        <SelectTrigger className="w-full h-12 rounded-xl border-border bg-muted/30 focus:ring-primary/20">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="office">Office Supplies</SelectItem>
                                            <SelectItem value="refresh">Refreshments</SelectItem>
                                            <SelectItem value="rent">Rent & Utilities</SelectItem>
                                            <SelectItem value="travel">Travel & Transport</SelectItem>
                                            <SelectItem value="other">Other Organization Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <FormInput
                                    name="amount"
                                    label="Amount (NPR)"
                                    placeholder="0.00"
                                    className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    name="paidTo"
                                    label="Merchant / Paid To"
                                    placeholder="Name of vendor"
                                    className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                />
                                <FormInput
                                    name="date"
                                    label="Date of Expense"
                                    type="date"
                                    className="rounded-xl border-border bg-muted/30 h-12 px-4 focus-visible:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground/70 ml-1">Notes / Description</Label>
                                <textarea
                                    {...form.register('notes')}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all min-h-[120px]"
                                    placeholder="Provide brief details about this expense..."
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold text-foreground/70 ml-1">Attach Receipt / Bill</Label>
                                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center bg-muted/10 group hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer">
                                    <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
                                    <Typography variant="p" className="font-bold text-foreground">Click to upload or drag & drop</Typography>
                                    <Typography variant="small" className="text-xs text-muted-foreground mt-1 text-center">PNG, JPG or PDF (Max 5MB)</Typography>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border flex gap-4">
                                <Button type="button" variant="outline" className="px-8 h-12 rounded-xl border-border text-foreground font-bold" onClick={() => navigate('/expenses')}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all">
                                    Submit for Approval
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
