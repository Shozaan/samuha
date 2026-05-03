import { Card, CardHeader, CardTitle, CardContent, Typography, Button } from '@sujan77/ui-components';
import { HandCoins, Download } from 'lucide-react';

export function LoanDocuments() {
    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Loan Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {[
                    { name: 'Agreement.pdf', size: '1.2MB' },
                    { name: 'Citizenship_Copy.jpg', size: '2.4MB' },
                    { name: 'Collateral_Photo.jpg', size: '4.1MB' }
                ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                                <HandCoins className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <Typography variant="small" className="font-bold text-foreground block truncate max-w-[100px]">{file.name}</Typography>
                                <Typography variant="small" className="text-[10px] text-muted-foreground">{file.size}</Typography>
                            </div>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                ))}
                <Button variant="outline" className="w-full border-dashed border-border text-muted-foreground mt-2 py-6">
                    + Add Document
                </Button>
            </CardContent>
        </Card>
    );
}
