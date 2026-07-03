import { Card, CardContent, Typography, Avatar, AvatarFallback } from '@sujan77/ui-components';

interface LoanHeaderSummaryProps {
    memberName: string;
    loanNumber: string;
    status: string;
    termStr: string;
    startDateStr: string;
    amountStr: string;
    paidStr: string;
    paidPercentage: number;
    remainingStr: string;
    interestStr: string;
    interestType: string;
    serviceChargeStr?: string;
}

export function LoanHeaderSummary({
    memberName,
    loanNumber,
    status,
    termStr,
    startDateStr,
    amountStr,
    paidStr,
    paidPercentage,
    remainingStr,
    interestStr,
    interestType,
    serviceChargeStr
}: LoanHeaderSummaryProps) {
    return (
        <Card className="border-border bg-card">
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex gap-6">
                        <Avatar className="w-16 h-16 rounded-xl border border-border bg-muted">
                            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary uppercase">{memberName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3">
                                <Typography variant="h2" className="text-2xl font-bold text-foreground">{memberName}</Typography>
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-primary/20">
                                    {loanNumber}
                                </span>
                            </div>
                            <Typography variant="muted" className="text-sm font-medium mt-1">Status: {status} • {termStr} Duration • Disbursed: {startDateStr}</Typography>
                        </div>
                    </div>
                    <div className="text-right">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Total Loan Amount</Typography>
                        <Typography variant="h3" className="text-3xl font-black text-foreground">NPR {amountStr}</Typography>
                    </div>
                </div>

                <div className={`grid grid-cols-1 gap-6 pt-8 mt-8 border-t border-border ${serviceChargeStr ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-2">Amount Paid</Typography>
                        <Typography variant="p" className="text-xl font-bold text-foreground">NPR {paidStr}</Typography>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full">
                            <div className="h-full bg-success rounded-full" style={{ width: `${paidPercentage}%` }} />
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-2">Remaining Balance</Typography>
                        <Typography variant="p" className="text-xl font-bold text-foreground">NPR {remainingStr}</Typography>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${100 - paidPercentage}%` }} />
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                        <Typography variant="small" className="text-primary uppercase text-[10px] font-bold block mb-2">Interest Rate</Typography>
                        <Typography variant="h3" className="text-2xl font-black text-primary">{interestStr}</Typography>
                        <Typography variant="small" className="text-[10px] text-primary/60 font-bold mt-1 uppercase">{interestType}</Typography>
                    </div>
                    {serviceChargeStr && (
                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <Typography variant="small" className="text-amber-600 uppercase text-[10px] font-bold block mb-2">Service Charge</Typography>
                            <Typography variant="h3" className="text-2xl font-black text-amber-600">NPR {serviceChargeStr}</Typography>
                            <Typography variant="small" className="text-[10px] text-amber-600/60 font-bold mt-1 uppercase">1% — Group Earning</Typography>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
