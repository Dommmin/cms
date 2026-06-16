'use client';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';
import type { BlockRendererProps } from '../block-renderer.types';

const variantConfig = {
    info: {
        bg: 'bg-accent',
        border: 'border-border',
        text: 'text-accent-foreground',
        icon: Info,
    },
    warning: {
        bg: 'bg-secondary',
        border: 'border-border',
        text: 'text-secondary-foreground',
        icon: AlertTriangle,
    },
    success: {
        bg: 'bg-muted',
        border: 'border-border',
        text: 'text-foreground',
        icon: CheckCircle,
    },
    error: {
        bg: 'bg-destructive/10',
        border: 'border-destructive/30',
        text: 'text-destructive',
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
        <div
            className={cn(
                'my-2 flex items-center gap-3 rounded-lg border px-4 py-3',
                variantCfg.bg,
                variantCfg.border,
                variantCfg.text,
            )}
        >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">
                {message}
                {link && (
                    <a
                        href={link}
                        className="ml-2 underline hover:no-underline"
                    >
                        {link_label ?? 'Learn more'}
                    </a>
                )}
            </p>
            {dismissable && (
                <button
                    type="button"
                    aria-label="Dismiss alert"
                    onClick={() => {
                        setDismissed(true);
                        Cookies.set(cookieKey, '1', { expires: 7 });
                    }}
                    className="shrink-0 hover:opacity-70"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
