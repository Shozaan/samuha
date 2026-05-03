import {
    FileText,
    Download,
    FileArchive,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    PieChart,
    BarChart3
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Typography,
    Button,
    Avatar,
    AvatarFallback
} from '@sujan77/ui-components';

export default function Reports() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Financial Reports</Typography>
                    <Typography variant="muted">Generate and download periodic group financial summaries and audit logs.</Typography>
                </div>
                <Button className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2">
                    <FileArchive className="w-4 h-4" />
                    Download Yearly Archive
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-border bg-card">
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <CardTitle className="text-xl font-bold text-foreground">Monthly Ledger Logs</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['February 2024', 'January 2024', 'December 2023', 'November 2023'].map((month) => (
                                    <div key={month} className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-card border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <Typography variant="small" className="font-bold text-foreground">{month}</Typography>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/5 h-10">Load 2023 Archives</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-secondary" />
                                <CardTitle className="text-xl font-bold text-foreground">Special Statements</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {[
                                    { title: 'Annual Tax Summary', desc: 'Fiscal Year 2080/81 summary', type: 'PDF' },
                                    { title: 'Member Dividend Report', desc: 'Projected profit sharing for all members', type: 'XLS' },
                                    { title: 'Loan Recovery Audit', desc: 'Detailed analysis of repayment health', type: 'PDF' }
                                ].map((report, i) => (
                                    <div key={i} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-muted/30 transition-colors group gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center border border-border shrink-0">
                                                <PieChart className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                                            </div>
                                            <div>
                                                <Typography variant="p" className="font-bold text-foreground">{report.title}</Typography>
                                                <Typography variant="small" className="text-xs text-muted-foreground">{report.desc}</Typography>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full md:w-auto text-[10px] font-bold uppercase tracking-widest border-border text-foreground hover:bg-muted py-1 h-9 flex items-center gap-2 px-4 shadow-sm">
                                            <Download className="w-3.5 h-3.5 text-secondary" />
                                            {report.type}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-secondary/20 bg-secondary/5 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                                <CardTitle className="text-lg font-bold">Growth Insight</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <Typography variant="small" className="text-muted-foreground text-xs font-medium">Group Assets Increase</Typography>
                                    <Typography variant="p" className="text-lg font-black text-secondary flex items-center gap-1">
                                        <ArrowUpRight className="w-4 h-4" />
                                        14.2%
                                    </Typography>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full">
                                    <div className="h-full bg-secondary w-[14.2%] rounded-full" />
                                </div>
                                <Typography variant="small" className="text-[10px] text-muted-foreground block text-right">Compared to last year</Typography>
                            </div>

                            <div className="pt-4 border-t border-secondary/10">
                                <Card className="border-border bg-card p-4 shadow-sm">
                                    <Typography variant="small" className="text-muted-foreground block text-[10px] font-bold uppercase mb-2">Top Performer (Month)</Typography>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 rounded-full border border-border bg-muted">
                                            <AvatarFallback className="text-[10px] font-bold bg-secondary/10 text-secondary uppercase">RB</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Typography variant="small" className="font-bold text-foreground block">Ram Bahadur</Typography>
                                            <Typography variant="small" className="text-[10px] text-muted-foreground">Highest deposit growth</Typography>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Report Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                <Typography variant="small" className="text-sm font-medium text-foreground">Auto-generate monthly</Typography>
                                <div className="w-8 h-4 bg-primary rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                            <Typography variant="small" className="text-[10px] text-muted-foreground italic leading-relaxed">
                                * Enabling this will automatically generate a PDF ledger on the 1st of every month and send it to all admins.
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
