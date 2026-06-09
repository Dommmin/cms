'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { SlotEntry } from '@/app/layout.types';
import { BlockRenderer } from '@/components/page-builder/block-renderer';
import type { BlockType } from '@/types/api';

interface SlotRendererProps {
    slots: SlotEntry[];
    location: string;
}

const paddingStyles = {
    none: 'py-0',
    sm: 'py-2 md:py-3',
    md: 'py-4 md:py-6',
    lg: 'py-8 md:py-12',
};

export function SlotRenderer({ slots, location }: SlotRendererProps) {
    const [dismissedSlots, setDismissedSlots] = useState<number[]>([]);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(
                `dismissed_slots_${location}`,
            );
            if (stored) {
                const parsed = JSON.parse(stored);
                setTimeout(() => setDismissedSlots(parsed), 0);
            }
        } catch {
            // ignore session storage errors
        }
    }, [location]);

    const handleDismiss = (id: number) => {
        const nextDismissed = [...dismissedSlots, id];
        setDismissedSlots(nextDismissed);
        try {
            sessionStorage.setItem(
                `dismissed_slots_${location}`,
                JSON.stringify(nextDismissed),
            );
        } catch {
            // ignore storage failures
        }
    };

    const visibleSlots = slots.filter(
        (slot) => !dismissedSlots.includes(slot.id),
    );

    if (visibleSlots.length === 0) return null;

    return (
        <div className={`global-slot-zone-${location} flex w-full flex-col`}>
            {visibleSlots.map((slot) => {
                // Adapt SlotEntry to PageBlock format expected by BlockRenderer
                const mockBlock = {
                    id: slot.id,
                    type: slot.block_type as BlockType,
                    configuration: slot.configuration,
                    position: slot.position,
                    is_active: true,
                    relations: slot.relations || [],
                    reusable_block_id: null,
                };

                const bg = slot.settings?.bg_color;
                const isFullWidth = slot.settings?.full_width ?? true;
                const isSticky = slot.settings?.sticky;
                const isDismissible = slot.settings?.dismissible;
                const padding = slot.settings?.padding ?? 'sm';

                const wrapperStyles = [
                    isSticky ? 'sticky top-0 z-50' : '',
                    paddingStyles[padding] || paddingStyles.sm,
                    'relative w-full',
                ]
                    .filter(Boolean)
                    .join(' ');

                const inner = (
                    <div className="relative w-full">
                        <BlockRenderer block={mockBlock} />
                        {isDismissible && (
                            <button
                                onClick={() => handleDismiss(slot.id)}
                                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/10 p-1 text-current transition-colors hover:bg-black/20"
                                aria-label="Dismiss banner"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                );

                return (
                    <div
                        key={slot.id}
                        className={wrapperStyles}
                        style={bg ? { backgroundColor: bg } : undefined}
                    >
                        {isFullWidth ? (
                            inner
                        ) : (
                            <div className="store-shell mx-auto px-4 sm:px-6 lg:px-8">
                                {inner}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
