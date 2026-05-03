import { useState, useMemo } from 'react';
import {
    Search,
    Wallet,
    HandCoins,
    AlertCircle,
    ReceiptText,
    UserPlus,
    Settings,
    ArrowRight,
    RefreshCw,
    CheckSquare,
    Ban,
    Repeat,
    CircleDollarSign,
    Landmark
} from 'lucide-react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Input
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useActivities } from './hooks/useActivities';

// Maps entity + activity type to a coloured icon
const getIcon = (entityType: string, activityType: string) => {
    if (entityType === 'DEPOSIT') return <Wallet className="w-5 h-5 text-success" />;
    if (entityType === 'LOAN') {
        if (activityType === 'DISBURSE') return <CircleDollarSign className="w-5 h-5 text-primary" />;
        if (activityType === 'APPROVE') return <CheckSquare className="w-5 h-5 text-primary" />;
        if (activityType === 'REJECT') return <Ban className="w-5 h-5 text-destructive" />;
        return <HandCoins className="w-5 h-5 text-primary" />;
    }
    if (entityType === 'REPAYMENT') return <Repeat className="w-5 h-5 text-info" />;
    if (entityType === 'FINE') return <AlertCircle className="w-5 h-5 text-warning" />;
    if (entityType === 'EXPENSE') return <ReceiptText className="w-5 h-5 text-destructive" />;
    if (entityType === 'MEMBER') return <UserPlus className="w-5 h-5 text-secondary" />;
    if (entityType === 'GROUP_RULE') return <Settings className="w-5 h-5 text-info" />;
    if (entityType === 'SETTLEMENT') return <Landmark className="w-5 h-5 text-muted-foreground" />;
    return <ArrowRight className="w-5 h-5 text-muted-foreground" />;
};

const getBgColor = (entityType: string) => {
    if (entityType === 'DEPOSIT') return 'border-success/20 bg-success/5';
    if (entityType === 'LOAN') return 'border-primary/20 bg-primary/5';
    if (entityType === 'REPAYMENT') return 'border-info/20 bg-info/5';
    if (entityType === 'FINE') return 'border-warning/20 bg-warning/5';
    if (entityType === 'EXPENSE') return 'border-destructive/20 bg-destructive/5';
    return 'border-border bg-muted';
};

const ENTITY_FILTER_OPTIONS = ['ALL', 'DEPOSIT', 'LOAN', 'REPAYMENT', 'FINE', 'EXPENSE', 'MEMBER', 'GROUP_RULE'];

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function Activity() {
    const { activeGroupId } = useGlobalStore();
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const LIMIT = 25;

    const { data, isLoading, refetch } = useActivities({
        groupId: activeGroupId || '',
        limit: LIMIT,
        page,
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
    });

    const logs: any[] = data?.data || [];
    const pagination = data?.pagination;

    const filtered = useMemo(() => {
        if (!search.trim()) return logs;
        const q = search.toLowerCase();
        return logs.filter((l: any) =>
            l.actorName?.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.action?.toLowerCase().includes(q)
        );
    }, [logs, search]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Group Activity Feed</Typography>
                    <Typography variant="muted">Real-time chronological log of all actions in the group.</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="border-border text-muted-foreground flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                    <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-72 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                            placeholder="Search activity log..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>
            </div>

            {/* Entity Type Filter Pills */}
            <div className="flex gap-2 flex-wrap">
                {ENTITY_FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => { setEntityFilter(opt); setPage(1); }}
                        className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border transition-all ${entityFilter === opt
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {/* Activity Feed */}
            <Card className="border-border bg-card">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-16 flex justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground space-y-2">
                            <Landmark className="w-10 h-10 mx-auto opacity-20" />
                            <Typography variant="p" className="font-medium">No activity found.</Typography>
                            <Typography variant="small" className="text-xs">
                                Activities are logged automatically as actions are taken in the group.
                            </Typography>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filtered.map((log: any) => (
                                <div
                                    key={log.id}
                                    className="p-5 md:p-6 hover:bg-muted/30 transition-all group flex items-start gap-5"
                                >
                                    {/* Icon */}
                                    <div className={`mt-0.5 p-3 rounded-2xl border shrink-0 transition-colors group-hover:shadow-sm ${getBgColor(log.entityType)}`}>
                                        {getIcon(log.entityType, log.activityType)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                            <Typography variant="p" className="font-bold text-foreground truncate">
                                                {log.actorName}
                                                <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                                                    {log.actorRole}
                                                </span>
                                            </Typography>
                                            <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest shrink-0">
                                                {timeAgo(log.createdAt)}
                                            </Typography>
                                        </div>
                                        <Typography variant="small" className="text-muted-foreground text-sm leading-relaxed">
                                            {log.description}
                                        </Typography>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-border text-muted-foreground">
                                                {log.entityType}
                                            </span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-border text-muted-foreground">
                                                {log.activityType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between">
                            <Typography variant="small" className="text-xs text-muted-foreground font-medium">
                                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total events
                            </Typography>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="text-xs h-8 px-4"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="text-xs h-8 px-4"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty pagination - just a note */}
                    {(!pagination || pagination.totalPages <= 1) && filtered.length > 0 && (
                        <div className="p-6 border-t border-border bg-muted/20 text-center">
                            <Typography variant="small" className="text-xs text-muted-foreground font-medium">
                                {filtered.length} events shown
                            </Typography>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
