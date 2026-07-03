import { useState } from 'react';
import {
    FileText,
    Calendar,
    RefreshCw,
    ChevronDown,
    TrendingUp,
    HandCoins,
    Repeat,
    AlertCircle,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Typography,
    Button,
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useMonthlyLedger } from './hooks/useReports';

function formatMonthYear(my: string) {
    const [year, month] = my.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    if (value === 0) return null;
    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${color}`}>
            {icon}
            <span>{label}: NPR {value.toLocaleString()}</span>
        </div>
    );
}

export default function Reports() {
    const { activeGroupId } = useGlobalStore();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const { data, isLoading, refetch } = useMonthlyLedger(activeGroupId || '', selectedYear);

    const ledgers = data?.data || [];
    const availableYears = data?.meta?.availableYears || [currentYear];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Financial Reports</Typography>
                    <Typography variant="muted">Monthly financial summaries for the group.</Typography>
                </div>
                <div className="flex items-center gap-3">
                    {/* Year selector */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(parseInt(e.target.value))}
                            className="appearance-none h-9 pl-4 pr-8 rounded-xl border border-border bg-card text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="border-border text-muted-foreground flex items-center gap-2 h-9"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="border-border bg-card">
                <CardHeader className="border-b border-border pb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl font-bold text-foreground">
                            Monthly Ledger — {selectedYear}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-16 flex justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : ledgers.length === 0 ? (
                        <div className="p-16 text-center space-y-2">
                            <FileText className="w-10 h-10 mx-auto text-muted-foreground opacity-20" />
                            <Typography variant="p" className="font-medium text-muted-foreground">No activity recorded for {selectedYear}.</Typography>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {ledgers.map((entry) => {
                                const total = entry.totalDeposits + entry.totalRepayments + entry.totalFines;
                                return (
                                    <div key={entry.monthYear} className="p-5 md:p-6 hover:bg-muted/30 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl border border-border bg-muted/30 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <Typography variant="p" className="font-bold text-foreground">
                                                        {formatMonthYear(entry.monthYear)}
                                                    </Typography>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        <StatPill
                                                            icon={<TrendingUp className="w-3 h-3" />}
                                                            label="Deposits"
                                                            value={entry.totalDeposits}
                                                            color="border-success/30 text-success bg-success/5"
                                                        />
                                                        <StatPill
                                                            icon={<HandCoins className="w-3 h-3" />}
                                                            label="Loans"
                                                            value={entry.totalLoans}
                                                            color="border-primary/30 text-primary bg-primary/5"
                                                        />
                                                        <StatPill
                                                            icon={<Repeat className="w-3 h-3" />}
                                                            label="Repayments"
                                                            value={entry.totalRepayments}
                                                            color="border-info/30 text-info bg-info/5"
                                                        />
                                                        <StatPill
                                                            icon={<AlertCircle className="w-3 h-3" />}
                                                            label="Fines"
                                                            value={entry.totalFines}
                                                            color="border-warning/30 text-warning bg-warning/5"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Total In</Typography>
                                                <Typography variant="p" className="text-lg font-black text-foreground">
                                                    NPR {total.toLocaleString()}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
