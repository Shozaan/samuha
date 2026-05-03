import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    ExternalLink
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Input
} from '@sujan77/ui-components';
import { useAuth } from '../../context/AuthContext';

const expenses = [
    { id: 501, category: 'Office Supplies', amount: '1,200', date: 'Apr 12, 2024', status: 'Approved', merchant: 'Stationery Mart' },
    { id: 502, category: 'Refreshments', amount: '850', date: 'Apr 10, 2024', status: 'Pending', merchant: 'Local Cafe' },
    { id: 503, category: 'Hall Rent', amount: '5,000', date: 'Apr 01, 2024', status: 'Approved', merchant: 'Community Hall' },
];

export default function ExpensesList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Group Expenses</Typography>
                    <Typography variant="muted">Track and manage all organizational spending and reimbursements.</Typography>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => navigate('/expenses/new')}
                        className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2 animate-in zoom-in duration-300"
                    >
                        <Plus className="w-4 h-4" />
                        Log New Expense
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Total Spent (April)</Typography>
                        <div className="flex items-center justify-between">
                            <Typography variant="h4" className="text-2xl font-black text-foreground">NPR 7,050</Typography>
                            <div className="bg-primary/10 text-primary p-2 rounded-xl">
                                <ExternalLink className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Pending Approvals</Typography>
                        <div className="flex items-center justify-between">
                            <Typography variant="h4" className="text-2xl font-black text-warning">2 Records</Typography>
                            <Button variant="outline" className="text-[10px] h-8 font-bold border-border">Review Now</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                    <div className="flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-96 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input
                            placeholder="Filter by merchant or category..."
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-border text-muted-foreground flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Category
                        </Button>
                        <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs">
                            Export Reports
                        </Button>
                    </div>
                </CardHeader>
                <div className="md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Expense ID</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Category</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Amount</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Merchant/Note</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <Typography variant="small" className="font-bold text-primary">#EXP-{expense.id}</Typography>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Typography variant="p" className="font-semibold text-foreground">{expense.category}</Typography>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Typography variant="p" className="font-black text-foreground">NPR {expense.amount}</Typography>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-muted-foreground">{expense.date}</td>
                                    <td className="px-8 py-5">
                                        <Typography variant="small" className="font-medium text-foreground/80">{expense.merchant}</Typography>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {expense.status === 'Approved' ? (
                                                <CheckCircle2 className="w-4 h-4 text-success" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-warning" />
                                            )}
                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${expense.status === 'Approved' ? 'text-success' : 'text-warning'
                                                }`}>
                                                {expense.status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="p-4 space-y-4 bg-card active:bg-muted/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Typography variant="small" className="text-[10px] text-primary font-black uppercase tracking-widest">#EXP-{expense.id}</Typography>
                                    <Typography variant="p" className="font-bold text-foreground text-base">{expense.category}</Typography>
                                </div>
                                <div className="text-right">
                                    <Typography variant="p" className="text-base font-black text-foreground">NPR {expense.amount}</Typography>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">{expense.date}</Typography>
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-3 border border-border/50 flex justify-between items-center">
                                <div className="space-y-1">
                                    <Typography variant="muted" className="text-[10px] uppercase font-bold block">Merchant</Typography>
                                    <Typography variant="p" className="text-xs font-semibold text-foreground">{expense.merchant}</Typography>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${expense.status === 'Approved' ? 'bg-success/5 border-success/20 text-success' : 'bg-warning/5 border-warning/20 text-warning'}`}>
                                    {expense.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{expense.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
