import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const alerts = [
    {
        id: 'info',
        label: 'info',
        className: 'bg-accent text-accent-foreground border-border',
        icon: Info,
        message: 'Informational message for neutral context.',
    },
    {
        id: 'success',
        label: 'success',
        className: 'bg-muted text-foreground border-border',
        icon: CheckCircle,
        message: 'Success — your changes were saved.',
    },
    {
        id: 'warning',
        label: 'warning',
        className: 'bg-secondary text-secondary-foreground border-border',
        icon: AlertTriangle,
        message: 'Warning — review settings before publishing.',
    },
    {
        id: 'danger',
        label: 'danger',
        className: 'bg-destructive/10 text-destructive border-destructive/30',
        icon: AlertCircle,
        message: 'Danger — this action cannot be undone.',
    },
] as const;

export function AlertsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Alerts"
                description="Alert patterns aligned with the page builder alert_banner block styling."
            />
            <div className="space-y-4">
                {alerts.map((alert) => {
                    const Icon = alert.icon;
                    return (
                        <div key={alert.id} className="space-y-2">
                            <p className="text-muted-foreground font-mono text-xs uppercase">
                                {alert.label}
                            </p>
                            <div
                                className={cn(
                                    'flex items-center gap-3 rounded-lg border px-4 py-3',
                                    alert.className,
                                )}
                                role="status"
                            >
                                <Icon
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium">
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
