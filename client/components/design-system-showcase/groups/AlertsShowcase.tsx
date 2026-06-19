import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const alerts = [
    {
        id: 'info',
        label: 'info',
        variant: 'info' as const,
        icon: Info,
        message: 'Informational message for neutral context.',
    },
    {
        id: 'success',
        label: 'success',
        variant: 'success' as const,
        icon: CheckCircle,
        message: 'Success — your changes were saved.',
    },
    {
        id: 'warning',
        label: 'warning',
        variant: 'warning' as const,
        icon: AlertTriangle,
        message: 'Warning — review settings before publishing.',
    },
    {
        id: 'danger',
        label: 'danger',
        variant: 'destructive' as const,
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
                            <Alert variant={alert.variant}>
                                <Icon aria-hidden="true" />
                                <AlertTitle>{alert.message}</AlertTitle>
                                <AlertDescription className="sr-only">
                                    {alert.label} alert example
                                </AlertDescription>
                            </Alert>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
