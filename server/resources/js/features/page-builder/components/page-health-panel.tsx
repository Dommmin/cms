import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { PageHealthPanelProps } from './page-health-panel.types';

export function PageHealthPanel({ issues, summary }: PageHealthPanelProps) {
    const __ = useTranslation();

    return (
        <div className="space-y-4 p-4">
            <div>
                <h2 className="text-sm font-semibold">
                    {__('builder.page_health', 'Page health')}
                </h2>
                <p className="text-xs text-muted-foreground">
                    {__(
                        'builder.page_health_hint',
                        'Pre-publish checks for headings, CTAs, links and image alt text.',
                    )}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-lg font-semibold">{summary.h1Count}</p>
                    <p className="text-[11px] text-muted-foreground">H1</p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-lg font-semibold">
                        {summary.errorCount}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {__('builder.errors', 'Errors')}
                    </p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-lg font-semibold">
                        {summary.warningCount}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {__('builder.warnings', 'Warnings')}
                    </p>
                </div>
            </div>

            {issues.length === 0 ? (
                <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                    <div className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            <p className="font-medium">
                                {__(
                                    'builder.page_health_clear',
                                    'No content health issues found.',
                                )}
                            </p>
                            <p className="mt-1 text-xs">
                                {__(
                                    'builder.page_health_clear_hint',
                                    'SEO metadata is checked in the page edit SEO panel.',
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {issues.map((issue) => {
                        const isError = issue.severity === 'error';
                        const Icon = isError ? AlertTriangle : Info;

                        return (
                            <div
                                key={issue.id}
                                className={`rounded-md border p-3 text-sm ${
                                    isError
                                        ? 'border-destructive/30 bg-destructive/10'
                                        : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
                                }`}
                            >
                                <div className="flex gap-2">
                                    <Icon
                                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                                            isError
                                                ? 'text-destructive'
                                                : 'text-amber-600 dark:text-amber-300'
                                        }`}
                                    />
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            {issue.title}
                                        </p>
                                        {issue.location && (
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {issue.location}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {issue.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {__(
                    'builder.page_health_seo_note',
                    'Title, meta description, canonical, robots and OG image warnings live in the SEO panel on the page edit screen.',
                )}
            </p>
        </div>
    );
}
