import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    ReceiptText,
    RefreshCw,
    X,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Input,
    Label,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Form,
    FormInput,
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useExpenses, useCreateExpense } from './hooks/useExpenses';

const EXPENSE_TYPES = [
    { value: 'MEETING', label: 'Meeting' },
    { value: 'OUTING', label: 'Outing' },
    { value: 'FOOD', label: 'Food & Refreshments' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'HOSTING', label: 'Hosting' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'AUDIT', label: 'Audit' },
    { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

const addSchema = z.object({
    expenseType: z.string().min(1, 'Category is required'),
    amount: z.string().min(1, 'Amount is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
    description: z.string().min(1, 'Description is required'),
    notes: z.string().optional(),
});
type AddForm = z.infer<typeof addSchema>;

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
        APPROVED: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Approved', cls: 'text-success border-success/20 bg-success/5' },
        PAID: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Paid', cls: 'text-info border-info/20 bg-info/5' },
        SUGGESTED: { icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending', cls: 'text-warning border-warning/20 bg-warning/5' },
        REJECTED: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'Rejected', cls: 'text-destructive border-destructive/20 bg-destructive/5' },
    };
    const s = map[status] ?? map['SUGGESTED'];
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
            {s.icon}
            {s.label}
        </div>
    );
}

export default function ExpensesList() {
    const { activeGroupId, role, activeMemberId } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';

    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const { data, isLoading, refetch } = useExpenses({ groupId: activeGroupId || '' });
    const createExpense = useCreateExpense();

    const expenses: any[] = data?.data || [];
    const pagination = data?.pagination;

    const filtered = useMemo(() => {
        if (!search.trim()) return expenses;
        const q = search.toLowerCase();
        return expenses.filter((e: any) =>
            e.description?.toLowerCase().includes(q) ||
            e.expenseType?.toLowerCase().includes(q) ||
            e.notes?.toLowerCase().includes(q)
        );
    }, [expenses, search]);

    // Summary stats
    const totalThisMonth = useMemo(() => {
        const now = new Date();
        return expenses
            .filter((e: any) => {
                const d = new Date(e.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0);
    }, [expenses]);

    const pendingCount = useMemo(() => expenses.filter((e: any) => e.status === 'SUGGESTED').length, [expenses]);

    // Form
    const { handleSubmit, setValue, watch, reset, ...form } = useForm<AddForm>({
        resolver: zodResolver(addSchema),
        defaultValues: { expenseType: 'MISCELLANEOUS', amount: '', description: '', notes: '' },
    });
    const expenseTypeVal = watch('expenseType');

    const onSubmit = (values: AddForm) => {
        createExpense.mutate(
            {
                groupId: activeGroupId!,
                expenseType: values.expenseType,
                amount: parseFloat(values.amount),
                description: values.description,
                notes: values.notes,
                suggestedById: activeMemberId || undefined,
                suggestedAt: new Date().toISOString(),
                status: 'SUGGESTED',
            },
            {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            }
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Group Expenses</Typography>
                    <Typography variant="muted">Track and manage all organizational spending.</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="border-border text-muted-foreground flex items-center gap-2 h-9"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                    {isAdmin && (
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Log Expense
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">
                            Total Spent (This Month)
                        </Typography>
                        <div className="flex items-center justify-between">
                            <Typography variant="h4" className="text-2xl font-black text-foreground">
                                NPR {totalThisMonth.toLocaleString()}
                            </Typography>
                            <div className="bg-primary/10 text-primary p-2 rounded-xl">
                                <ReceiptText className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">
                            Pending Approvals
                        </Typography>
                        <div className="flex items-center justify-between">
                            <Typography variant="h4" className={`text-2xl font-black ${pendingCount > 0 ? 'text-warning' : 'text-foreground'}`}>
                                {pendingCount} {pendingCount === 1 ? 'Record' : 'Records'}
                            </Typography>
                            <StatusBadge status="SUGGESTED" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                    <div className="flex items-center gap-3 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-96 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                            placeholder="Search by description or category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                </CardHeader>

                {isLoading ? (
                    <div className="p-16 flex justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center space-y-2">
                        <ReceiptText className="w-10 h-10 mx-auto text-muted-foreground opacity-20" />
                        <Typography variant="p" className="font-medium text-muted-foreground">No expenses recorded yet.</Typography>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((expense: any) => (
                                        <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-border text-muted-foreground bg-muted/30">
                                                    {EXPENSE_TYPES.find(t => t.value === expense.expenseType)?.label ?? expense.expenseType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Typography variant="p" className="font-semibold text-foreground">{expense.description}</Typography>
                                                {expense.notes && (
                                                    <Typography variant="small" className="text-xs text-muted-foreground mt-0.5">{expense.notes}</Typography>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Typography variant="p" className="font-black text-foreground">
                                                    NPR {parseFloat(expense.amount).toLocaleString()}
                                                </Typography>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(expense.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={expense.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-border">
                            {filtered.map((expense: any) => (
                                <div key={expense.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-muted/30">
                                                {EXPENSE_TYPES.find(t => t.value === expense.expenseType)?.label ?? expense.expenseType}
                                            </span>
                                            <Typography variant="p" className="font-bold text-foreground mt-1">{expense.description}</Typography>
                                        </div>
                                        <Typography variant="p" className="text-base font-black text-foreground">
                                            NPR {parseFloat(expense.amount).toLocaleString()}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Typography variant="small" className="text-xs text-muted-foreground">
                                            {new Date(expense.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <StatusBadge status={expense.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="p-6 border-t border-border bg-muted/20 text-center">
                        <Typography variant="small" className="text-xs text-muted-foreground font-medium">
                            {pagination.total} total expenses
                        </Typography>
                    </div>
                )}
            </Card>

            {/* Add Expense Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <ReceiptText className="w-5 h-5" />
                                </div>
                                <div>
                                    <Typography variant="p" className="font-bold text-foreground">Log New Expense</Typography>
                                    <Typography variant="small" className="text-xs text-muted-foreground">Record an official group expense</Typography>
                                </div>
                            </div>
                            <button
                                onClick={() => { setModalOpen(false); reset(); }}
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <Form {...form} watch={watch} setValue={setValue} handleSubmit={handleSubmit}>
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Category</Label>
                                        <Select
                                            value={expenseTypeVal}
                                            onValueChange={val => setValue('expenseType', val)}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/30">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXPENSE_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormInput
                                        name="amount"
                                        label="Amount (NPR)"
                                        placeholder="0.00"
                                        className="h-11 rounded-xl border-border bg-muted/30 px-4"
                                    />
                                </div>

                                <FormInput
                                    name="description"
                                    label="Description"
                                    placeholder="e.g. Annual meeting hall rent"
                                    className="h-11 rounded-xl border-border bg-muted/30 px-4"
                                />

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Notes (optional)</Label>
                                    <textarea
                                        {...form.register('notes')}
                                        rows={2}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-all resize-none"
                                        placeholder="Any additional details..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-11 rounded-xl"
                                        onClick={() => { setModalOpen(false); reset(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold"
                                        disabled={createExpense.isPending}
                                    >
                                        {createExpense.isPending ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Log Expense'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
}
