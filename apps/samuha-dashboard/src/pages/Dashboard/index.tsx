import {
    TrendingUp,
    Users,
    Wallet,
    HandCoins,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Typography,
    Button,
    Avatar,
    AvatarFallback
} from '@sujan77/ui-components';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useGlobalStore } from '../../store/store';
import { DashboardApi, type GroupDashboardStats, type MemberDashboardStats } from './dashboard.api';

export default function Dashboard() {
    const { user } = useAuth();
    const { activeGroupId } = useGlobalStore();

    const [isLoading, setIsLoading] = useState(true);
    const [groupData, setGroupData] = useState<GroupDashboardStats | null>(null);
    const [memberData, setMemberData] = useState<MemberDashboardStats | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                // Fetch in parallel
                const [groupRes, memberRes] = await Promise.all([
                    DashboardApi.getGroupStats(activeGroupId || 'default'),
                    DashboardApi.getMemberStats(activeGroupId || 'default', 'default')
                ]);
                setGroupData(groupRes);
                setMemberData(memberRes);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboard();
    }, [activeGroupId]);

    const formatCurr = (val: number) => `NPR ${val.toLocaleString()}`;

    const stats = [
        { label: 'Total Group Fund', value: formatCurr(groupData?.totalGroupFund || 0), change: 'Active', icon: Wallet, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Available Balance', value: formatCurr(groupData?.availableBalance || 0), change: 'Liquid', icon: TrendingUp, color: 'text-info', bg: 'bg-info/10' },
        { label: 'Total Deposits', value: formatCurr(groupData?.totalDeposits || 0), change: 'Lifetime', icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: 'Active Loans', value: formatCurr(groupData?.activeLoans || 0), change: 'Outstanding', icon: HandCoins, color: 'text-warning', bg: 'bg-warning/10' },
    ];

    const personalStats = [
        { label: 'My Total Deposit', value: formatCurr(memberData?.totalDeposit || 0), icon: Wallet, color: 'text-primary' },
        { label: 'Active Loan', value: formatCurr(memberData?.activeLoan || 0), icon: HandCoins, color: 'text-warning' },
        { label: 'Pending Fines', value: formatCurr(memberData?.pendingFines || 0), icon: AlertCircle, color: 'text-destructive' },
        { label: 'Next Installment', value: memberData?.nextInstallment ? new Date(memberData.nextInstallment).toLocaleDateString() : 'None', icon: Clock, color: 'text-info' },
    ];

    const contributionStats = [
        { label: 'Total Contribution', value: formatCurr(memberData?.totalDeposit || 0), description: 'Lifetime deposits' },
        { label: 'Total Fines Paid', value: formatCurr(memberData?.totalFinesPaid || 0), description: 'Late penalties' },
        { label: 'Amount Per Head', value: formatCurr(memberData?.amountPerHead || 0), description: 'Your share of group fund' },
    ];

    const recentActivity = groupData?.recentActivity || [];

    if (isLoading) {
        return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <Typography variant="h2" className="text-3xl font-bold text-foreground">Dashboard Overview</Typography>
                <Typography variant="muted">Welcome back, {user?.name || 'User'}. Here's what's happening today.</Typography>
            </div>

            {/* Group Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="group hover:shadow-md transition-all duration-300 border-border bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                                    {stat.change}
                                    {stat.change.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                </div>
                            </div>
                            <div>
                                <Typography variant="small" className="text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</Typography>
                                <Typography variant="h4" className="text-2xl font-bold text-foreground mt-1">{stat.value}</Typography>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Personal Dashboard Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
                    <Typography variant="h3" className="text-xl font-bold text-foreground italic uppercase tracking-widest">Personal Dashboard</Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {personalStats.map((stat) => (
                        <Card key={stat.label} className="border-border bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg bg-muted`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">{stat.label}</Typography>
                                    <Typography variant="p" className="font-bold text-foreground">{stat.value}</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                        {contributionStats.map((stat) => (
                            <div key={stat.label} className="p-6 hover:bg-muted/30 transition-colors">
                                <Typography variant="small" className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block mb-1">{stat.label}</Typography>
                                <Typography variant="h4" className="text-xl font-bold text-foreground">{stat.value}</Typography>
                                <Typography variant="small" className="text-[10px] text-muted-foreground italic">{stat.description}</Typography>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="md:col-span-2 border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                        </div>
                        <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-bold">View All</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12 border border-border bg-muted flex items-center justify-center text-xl shrink-0">
                                            <AvatarFallback className="bg-transparent">
                                                {activity.type === 'deposit' && '💰'}
                                                {activity.type === 'loan' && '🏦'}
                                                {activity.type === 'fine' && '⚠️'}
                                                {activity.type === 'expense' && '🧾'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Typography variant="p" className="font-semibold text-foreground group-hover:text-primary transition-colors">{activity.user}</Typography>
                                            <Typography variant="small" className="text-muted-foreground">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {new Date(activity.date).toLocaleDateString()}</Typography>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto pl-16 sm:pl-0">
                                        <Typography variant="p" className="font-bold text-foreground">NPR {activity.amount}</Typography>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1 inline-block ${activity.status.includes('Completed') || activity.status === 'Paid'
                                            ? 'bg-success/10 text-success'
                                            : 'bg-warning/10 text-warning'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Summary Card */}
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-foreground">Group Health</CardTitle>
                        <CardDescription className="text-muted-foreground">Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <Typography variant="small" className="text-muted-foreground">Monthly Deposits Collected</Typography>
                                <Typography variant="small" className="font-bold">85%</Typography>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[85%]" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <Typography variant="small" className="text-muted-foreground">Loan Recovery Rate</Typography>
                                <Typography variant="small" className="font-bold">92%</Typography>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-success w-[92%]" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border mt-6">
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <Typography variant="small" className="text-muted-foreground mb-2 block font-medium">Next Meeting Reminder</Typography>
                                <Typography variant="p" className="font-bold text-foreground">Saturday, Feb 7th</Typography>
                                <Typography variant="small" className="text-primary font-bold mt-1 block uppercase tracking-tighter">10:00 AM @ Community Hall</Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
