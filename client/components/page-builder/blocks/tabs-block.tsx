'use client';

import { sanitizeHtml } from '@/lib/sanitize';
import { useState } from 'react';

import type { TabsBlockProps, TabsConfig } from './tabs-block.types';

export function TabsBlock({ block }: TabsBlockProps) {
    const cfg = block.configuration as TabsConfig;
    const tabs = cfg.tabs ?? [];
    const [activeTab, setActiveTab] = useState(0);
    const variant = cfg.variant ?? 'underline';

    const tabClass = (isActive: boolean) => {
        if (variant === 'pills') {
            return isActive
                ? 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                : 'rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors';
        }
        if (variant === 'boxed') {
            return isActive
                ? 'border-b-2 border-primary px-4 py-3 text-sm font-medium text-primary bg-muted/30'
                : 'border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors';
        }
        // underline
        return isActive
            ? 'border-b-2 border-primary px-1 py-3 text-sm font-medium text-primary'
            : 'border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors';
    };

    const wrapperClass =
        variant === 'pills'
            ? 'flex gap-2 flex-wrap'
            : 'flex gap-4 border-b border-border overflow-x-auto';

    return (
        <div className="flex flex-col gap-6">
            {cfg.title && <h2 className="text-2xl font-bold">{cfg.title}</h2>}

            <div className={wrapperClass}>
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={tabClass(activeTab === i)}
                    >
                        {tab.icon && <span className="mr-1">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {tabs[activeTab]?.content && (
                <div
                    className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(tabs[activeTab].content!),
                    }}
                />
            )}
        </div>
    );
}
