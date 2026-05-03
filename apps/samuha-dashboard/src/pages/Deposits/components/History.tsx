import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Download,
    Filter,
    ArrowUpRight
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Button,
    Typography,
    Input,
    Avatar,
    AvatarFallback
} from '@sujan77/ui-components';

const history = [
    { id: 101, member: 'Ram Bahadur', amount: '2,000', type: 'Mandatory', date: 'Apr 10, 2024', method: 'E-Sewa' },
    { id: 102, member: 'Sita Kumari', amount: '2,500', type: 'Mandatory + Extra', date: 'Apr 08, 2024', method: 'Cash' },
    { id: 103, member: 'Gita Devi', amount: '2,000', type: 'Mandatory', date: 'Apr 07, 2024', method: 'Bank Transfer' },
    { id: 104, member: 'Ram Bahadur', amount: '2,000', type: 'Mandatory', date: 'Mar 12, 2024', method: 'E-Sewa' },
];

export default function DepositsHistory() {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/deposits')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Matrix
                </Button>
                <Button className="flex items-center gap-2 bg-primary text-primary-foreground font-bold shadow-md">
                    <Download className="w-4 h-4" />
                    Download Statement
                </Button>
            </div>

            <div>
                <Typography variant="h2" className="text-3xl font-bold text-foreground">Transaction History</Typography>
                <Typography variant="muted">Full audit log of all deposits received by the group.</Typography>
            </div>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                    <div className="flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-96 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input
                            placeholder="Search transactions..."
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 border-border text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        Filter by Date
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/50 uppercase tracking-wider">
                                    <th className="px-8 py-4">Transaction ID</th>
                                    <th className="px-8 py-4">Member</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {history.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-muted/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <Typography variant="small" className="font-bold text-primary">#TX-{tx.id}</Typography>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8 rounded-full border border-border bg-muted">
                                                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary uppercase">
                                                        {tx.member.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Typography variant="small" className="font-semibold text-foreground">{tx.member}</Typography>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1">
                                                <Typography variant="p" className="font-black text-foreground">NPR {tx.amount}</Typography>
                                                <ArrowUpRight className="w-3 h-3 text-success" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-foreground/60 font-medium border border-border">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Typography variant="small" className="text-muted-foreground">{tx.date}</Typography>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Typography variant="small" className="font-medium text-foreground/80">{tx.method}</Typography>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
