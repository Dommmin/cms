'use client';
import Cookies from 'js-cookie';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

import type { BlockRendererProps } from '../block-renderer.types';

const variantConfig = {
    info: {
        variant: 'info' as const,
        icon: Info,
    },
    warning: {
        variant: 'warning' as const,
        icon: AlertTriangle,
    },
    success: {
        variant: 'success' as const,
        icon: CheckCircle,
    },
    error: {
        variant: 'destructive' as const,
        icon: AlertCircle,
    },
};

export function AlertBannerBlock({ block }: BlockRendererProps) {
    const cfg = block.configuration as Record<string, unknown>;
    const message = cfg.message as string | undefined;
    const link = cfg.link as string | undefined;
    const link_label = cfg.link_label as string | undefined;
    const variant = (cfg.variant as string | undefined) ?? 'info';
    const dismissable = cfg.dismissable !== false;

    const cookieKey = `pb-alert-dismissed-${block.id}`;
    const [dismissed, setDismissed] = useState(
        () => Cookies.get(cookieKey) === '1',
    );

    if (dismissed || !message) return null;

    const variantCfg =
        variantConfig[variant as keyof typeof variantConfig] ??
        variantConfig.info;
    const Icon = variantCfg.icon;

    return (
        <Alert
            variant={variantCfg.variant}
            className={cn('my-2 items-center', dismissable && 'pr-10')}
        >
            <Icon aria-hidden="true" />
            <AlertDescription className="text-foreground col-start-2 text-sm font-medium">
                {message}
                {link && (
                    <a
                        href={link}
                        className="ml-2 underline hover:no-underline"
                    >
                        {link_label ?? 'Learn more'}
                    </a>
                )}
            </AlertDescription>
            {dismissable && (
                <button
                    type="button"
                    aria-label="Dismiss alert"
                    onClick={() => {
                        setDismissed(true);
                        Cookies.set(cookieKey, '1', { expires: 7 });
                    }}
                    className="absolute top-3 right-3 shrink-0 hover:opacity-70"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </Alert>
    );
}
