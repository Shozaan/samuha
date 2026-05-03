import { useState, useMemo } from 'react';
import {
    Search,
    Download,
    Filter,
    CheckCircle2,
    RefreshCw,
    AlertTriangle,
    XCircle,
    Zap
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Input,
    Avatar,
    AvatarFallback
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useFinesByGroup, useFinesByMember, useMarkFinePaid, useWaiveFine, useRunFineEngine } from './hooks/useFines';

type FilterStatus = 'ALL' | 'PENDING' | 'PAID' | 'WAIVED';

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning',
    PAID: 'bg-success/10 text-success',
    WAIVED: 'bg-muted text-muted-foreground',
    LATE: 'bg-destructive/10 text-destructive',
};

const FINE_TYPE_LABELS: Record<string, string> = {
    LATE_DEPOSIT: 'Late Deposit',
    LATE_EMI: 'Late EMI',
    OTHER: 'Other',
};

export default function FinesList() {
    const { activeGroupId, activeMemberId, role } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

    // Admins see group-wide fines, members see only their own
    const { data: groupFinesRes, isLoading: loadingGroup } = useFinesByGroup(isAdmin ? (activeGroupId || '') : '');
    const { data: memberFinesRes, isLoading: loadingMember } = useFinesByMember(!isAdmin ? (activeMemberId || '') : '');

    const markPaid = useMarkFinePaid();
    const waive = useWaiveFine();
    const runEngine = useRunFineEngine();

    const rawFines: any[] = isAdmin
        ? (groupFinesRes?.data || [])
        : (memberFinesRes?.data || []);

    const isLoading = isAdmin ? loadingGroup : loadingMember;

    const fines = useMemo(() => {
        return rawFines.filter((f: any) => {
            const memberName = f.member?.user?.name || '';
            const matchesSearch =
                memberName.toLowerCase().includes(search.toLowerCase()) ||
                f.reason.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rawFines, search, statusFilter]);

    // Stats
    const totalOutstanding = rawFines
        .filter((f: any) => f.status === 'PENDING')
        .reduce((sum: number, f: any) => sum + Number(f.amount), 0);

    const totalCollected = rawFines
        .filter((f: any) => f.status === 'PAID')
        .reduce((sum: number, f: any) => sum + Number(f.amount), 0);

    const pendingCount = rawFines.filter((f: any) => f.status === 'PENDING').length;

    const mostCommonType = useMemo(() => {
        const counts = rawFines.reduce((acc: Record<string, number>, f: any) => {
            acc[f.fineType] = (acc[f.fineType] || 0) + 1;
            return acc;
        }, {});
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? FINE_TYPE_LABELS[top[0]] || top[0] : 'N/A';
    }, [rawFines]);

    const handleMarkPaid = (fineId: string) => {
        if (window.confirm('Mark this fine as paid (Cash)?')) {
            markPaid.mutate({ fineId, paymentMode: 'CASH' });
        }
    };

    const handleWaive = (fineId: string) => {
        const reason = window.prompt('Enter reason for waiving this fine:');
        if (reason) {
            waive.mutate({ fineId, waivedBy: activeMemberId || 'Admin', reason });
        }
    };

    const handleRunEngine = () => {
        if (window.confirm('Run the fine engine now? This will calculate and apply all overdue fines.')) {
            runEngine.mutate();
        }
    };

    const nextFilter = (): FilterStatus => {
        const cycle: FilterStatus[] = ['ALL', 'PENDING', 'PAID', 'WAIVED'];
        const idx = cycle.indexOf(statusFilter);
        return cycle[(idx + 1) % cycle.length];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Fines & Penalties</Typography>
                    <Typography variant="muted">
                        {isAdmin ? 'Group-wide fine management.' : 'Your outstanding fines and penalties.'}
                    </Typography>
                </div>
                {isAdmin && (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRunEngine}
                            disabled={runEngine.isPending}
                            className="border-border text-muted-foreground flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            {runEngine.isPending ? 'Calculating...' : 'Run Fine Engine'}
                        </Button>
                        <Button className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Log
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">
                            Total Outstanding
                        </Typography>
                        <div className="flex items-center gap-3">
                            <Typography variant="h4" className="text-2xl font-black text-foreground">
                                NPR {totalOutstanding.toLocaleString()}
                            </Typography>
                            {pendingCount > 0 && (
                                <span className="p-1 px-2 rounded bg-warning/10 text-warning text-[8px] font-bold uppercase">
                                    {pendingCount} Pending
                                </span>
                            )}
                        </div>
                        <Typography variant="small" className="text-[10px] text-muted-foreground mt-2 font-medium">
                            {isLoading ? 'Loading...' : `From ${pendingCount} pending records`}
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">
                            Total Collected
                        </Typography>
                        <Typography variant="h4" className="text-2xl font-black text-success">
                            NPR {totalCollected.toLocaleString()}
                        </Typography>
                        <Typography variant="small" className="text-[10px] text-muted-foreground mt-2 font-medium">
                            {rawFines.filter((f: any) => f.status === 'PAID').length} fines cleared
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="border-border bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-primary uppercase text-[10px] font-bold block mb-1">
                            Most Common Reason
                        </Typography>
                        <Typography variant="p" className="text-lg font-bold text-foreground">{mostCommonType}</Typography>
                        <Typography variant="small" className="text-[10px] text-primary font-bold mt-1 uppercase">
                            {rawFines.length} total fines
                        </Typography>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                    <div className="flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-96 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by member or reason..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setStatusFilter(nextFilter())}
                        className="border-border text-muted-foreground flex items-center gap-2 min-w-[140px]"
                    >
                        <Filter className="w-4 h-4" />
                        Status: {statusFilter}
                    </Button>
                </CardHeader>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                {isAdmin && <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Member</th>}
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Type</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Reason</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Amount</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Status</th>
                                {isAdmin && <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 5} className="px-8 py-10 text-center">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                                    </td>
                                </tr>
                            ) : fines.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 5} className="px-8 py-12 text-center text-muted-foreground">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No fines found.</p>
                                    </td>
                                </tr>
                            ) : fines.map((fine: any) => {
                                const memberName = fine.member?.user?.name || 'Unknown';
                                const initials = memberName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                                return (
                                    <tr key={fine.id} className="hover:bg-muted/30 transition-colors">
                                        {isAdmin && (
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 rounded-full border border-border bg-muted">
                                                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary uppercase">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Typography variant="p" className="font-semibold text-foreground">{memberName}</Typography>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                                {FINE_TYPE_LABELS[fine.fineType] || fine.fineType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 max-w-xs">
                                            <Typography variant="small" className="text-muted-foreground font-medium line-clamp-2">{fine.reason}</Typography>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Typography variant="p" className="font-black text-foreground">NPR {Number(fine.amount).toLocaleString()}</Typography>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Typography variant="small" className="text-muted-foreground">
                                                {new Date(fine.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${STATUS_STYLES[fine.status] || 'bg-muted text-muted-foreground'}`}>
                                                {fine.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-8 py-5 text-right">
                                                {fine.status === 'PENDING' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleMarkPaid(fine.id)}
                                                            disabled={markPaid.isPending}
                                                            className="text-xs font-bold text-success hover:bg-success/5 uppercase h-8 px-3"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Paid
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleWaive(fine.id)}
                                                            disabled={waive.isPending}
                                                            className="text-xs font-bold text-muted-foreground hover:bg-muted uppercase h-8 px-3"
                                                        >
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Waive
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 text-success">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-[10px] font-bold uppercase">{fine.status}</span>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                    {fines.map((fine: any) => {
                        const memberName = fine.member?.user?.name || 'Unknown';
                        return (
                            <div key={fine.id} className="p-4 space-y-4 bg-card active:bg-muted/30 transition-all">
                                <div className="flex justify-between items-start">
                                    {isAdmin && (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border border-border bg-muted">
                                                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary uppercase">
                                                    {memberName.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Typography variant="p" className="font-bold text-foreground">{memberName}</Typography>
                                                <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">
                                                    {new Date(fine.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-auto ${STATUS_STYLES[fine.status] || 'bg-muted text-muted-foreground'}`}>
                                        {fine.status}
                                    </span>
                                </div>
                                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                                    <div className="flex justify-between items-end gap-2">
                                        <div className="space-y-1">
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                                {FINE_TYPE_LABELS[fine.fineType] || fine.fineType}
                                            </span>
                                            <Typography variant="p" className="text-xs font-medium text-foreground mt-1">{fine.reason}</Typography>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <Typography variant="muted" className="text-[10px] uppercase font-bold block">Penalty</Typography>
                                            <Typography variant="p" className="text-base font-black text-foreground">NPR {Number(fine.amount).toLocaleString()}</Typography>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && fine.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleMarkPaid(fine.id)}
                                            className="flex-1 bg-success text-white font-bold uppercase tracking-widest text-[10px] py-1 h-9 rounded-lg"
                                        >
                                            Mark Paid
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleWaive(fine.id)}
                                            className="flex-1 border-border text-muted-foreground font-bold uppercase tracking-widest text-[10px] py-1 h-9 rounded-lg"
                                        >
                                            Waive
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
