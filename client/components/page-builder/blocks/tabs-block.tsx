'use client';

import { sanitizeHtml } from '@/lib/sanitize';

import { BlockHeader } from '@/components/composition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type { TabsBlockProps, TabsConfig } from './tabs-block.types';

export function TabsBlock({ block }: TabsBlockProps) {
    const cfg = block.configuration as TabsConfig;
    const tabs = cfg.tabs ?? [];
    const variant = cfg.variant ?? 'underline';

    const listVariant = variant === 'pills' ? 'default' : 'line';
    const listClassName = cn(
        variant === 'pills' && 'h-auto flex-wrap gap-2 p-1',
        (variant === 'boxed' || variant === 'underline') &&
            'border-border h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0',
        variant === 'underline' && 'gap-4',
    );
    const triggerClassName = cn(
        variant === 'pills' &&
            'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto flex-none px-4 py-2',
        (variant === 'boxed' || variant === 'underline') &&
            'data-[state=active]:bg-muted/30 h-auto flex-none rounded-none px-4 py-3',
    );

    return (
        <div className="flex flex-col gap-6">
            <BlockHeader title={cfg.title} size="base" />

            {tabs.length > 0 ? (
                <Tabs defaultValue="tab-0">
                    <TabsList variant={listVariant} className={listClassName}>
                        {tabs.map((tab, i) => (
                            <TabsTrigger
                                key={i}
                                value={`tab-${i}`}
                                className={triggerClassName}
                            >
                                {tab.icon ? <span>{tab.icon}</span> : null}
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.map((tab, i) => (
                        <TabsContent key={i} value={`tab-${i}`}>
                            {tab.content ? (
                                <div
                                    className="prose dark:prose-invert"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(tab.content),
                                    }}
                                />
                            ) : null}
                        </TabsContent>
                    ))}
                </Tabs>
            ) : null}
        </div>
    );
}
