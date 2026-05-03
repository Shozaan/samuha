import { Card, CardHeader, CardTitle, Typography } from '@sujan77/ui-components';

interface ScheduleItem {
    month: string;
    amount: string;
    status: string;
    date: string;
}

interface LoanRepaymentScheduleProps {
    schedule: ScheduleItem[];
}

export function LoanRepaymentSchedule({ schedule }: LoanRepaymentScheduleProps) {
    return (
        <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-lg font-bold">Repayment Schedule</CardTitle>
            </CardHeader>
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase">Installment</th>
                            <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Due Date</th>
                            <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Amount</th>
                            <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {schedule.length > 0 ? schedule.map((item, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="px-8 py-5">
                                    <Typography variant="p" className="font-bold text-foreground">{item.month}</Typography>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <Typography variant="small" className="text-muted-foreground">{item.date}</Typography>
                                </td>
                                <td className="px-8 py-5 text-right font-black text-foreground">
                                    NPR {item.amount}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${item.status === 'PAID' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-muted-foreground">
                                    No repayment schedule generated yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
                {schedule.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between bg-card active:bg-muted/50 transition-colors">
                        <div>
                            <Typography variant="p" className="font-bold text-foreground">{item.month}</Typography>
                            <Typography variant="small" className="text-[10px] text-muted-foreground font-bold block">{item.date}</Typography>
                        </div>
                        <div className="text-right space-y-2">
                            <Typography variant="p" className="font-black text-foreground text-sm">NPR {item.amount}</Typography>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest block ${item.status === 'PAID' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
