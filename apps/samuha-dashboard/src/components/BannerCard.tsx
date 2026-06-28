import { ReactNode } from 'react';
import { Card, CardContent, Typography } from '@sujan77/ui-components';

export type BannerVariant = 'success' | 'warning' | 'destructive';

export interface BannerCardProps {
    variant: BannerVariant;
    icon: ReactNode;
    title: ReactNode;
    subtitle: ReactNode;
    badges?: ReactNode;
    rightLabel?: string;
    rightValue?: ReactNode;
    rightSubtext?: ReactNode;
    rightAction?: ReactNode;
}

export function BannerCard({
    variant,
    icon,
    title,
    subtitle,
    badges,
    rightLabel,
    rightValue,
    rightSubtext,
    rightAction
}: BannerCardProps) {
    const variantStyles = {
        success: {
            borderBg: 'border-success/30 bg-success/5',
            iconBg: 'bg-success/15 text-success',
            titleColor: 'text-success',
            rightBorder: 'border-success/20',
            valueColor: 'text-success'
        },
        warning: {
            borderBg: 'border-warning/30 bg-warning/5',
            iconBg: 'bg-warning/15 text-warning',
            titleColor: 'text-warning',
            rightBorder: 'border-warning/20',
            valueColor: 'text-foreground'
        },
        destructive: {
            borderBg: 'border-destructive/40 bg-destructive/5',
            iconBg: 'bg-destructive/15 text-destructive',
            titleColor: 'text-destructive',
            rightBorder: 'border-destructive/20',
            valueColor: 'text-destructive'
        }
    };

    const s = variantStyles[variant];

    return (
        <Card className={`overflow-hidden border-2 transition-all ${s.borderBg}`}>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 md:gap-5 p-5 md:p-6 flex-1">
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0 ${s.iconBg}`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Typography variant="h4" className={`text-xl font-black ${s.titleColor}`}>
                                    {title}
                                </Typography>
                                {badges && <div>{badges}</div>}
                            </div>
                            <Typography variant="small" className="text-muted-foreground text-xs">
                                {subtitle}
                            </Typography>
                        </div>
                    </div>

                    {/* Right Section */}
                    {(rightLabel || rightValue || rightAction || rightSubtext) && (
                        <div className={`flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 px-5 md:px-6 py-4 md:py-6 border-t md:border-t-0 md:border-l ${s.rightBorder} bg-background/40 min-w-[200px]`}>
                            <div className="text-center md:text-right flex-1 md:flex-none">
                                {rightLabel && (
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-0.5">
                                        {rightLabel}
                                    </Typography>
                                )}
                                {rightValue && (
                                    <Typography variant="h4" className={`text-2xl md:text-3xl font-black ${s.valueColor}`}>
                                        {rightValue}
                                    </Typography>
                                )}
                                {rightSubtext && (
                                    <div className="mt-1 md:mt-2">{rightSubtext}</div>
                                )}
                            </div>
                            {rightAction && (
                                <div className="mt-0 md:mt-2 w-full md:w-auto shrink-0">
                                    {rightAction}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
