import { useCallback } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { CanvasBlockPreview } from './canvas-block-preview';
import type { CanvasViewProps } from './canvas-view.types';

const variantStyles: Record<string, string> = {
    light: 'bg-background text-foreground',
    dark: 'bg-foreground text-background',
    muted: 'bg-muted text-foreground',
    brand: 'bg-primary text-primary-foreground',
    centered: 'bg-foreground text-background',
    'left-aligned': 'bg-foreground text-background',
    split: 'bg-foreground text-background',
    solid: 'bg-primary text-primary-foreground',
    gradient:
        'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
    outlined: 'border-2 border-primary text-foreground',
    hero: 'bg-foreground text-background',
    faq: 'bg-background text-foreground',
    contact: 'bg-background text-foreground',
};

const layoutStyles: Record<string, string> = {
    contained: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    'full-width': 'w-full',
    flush: 'w-full',
    'two-col':
        'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8',
    'three-col':
        'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8',
    '50-50': 'grid grid-cols-1 md:grid-cols-2',
    '60-40': 'grid grid-cols-1 md:grid-cols-[3fr_2fr]',
    '40-60': 'grid grid-cols-1 md:grid-cols-[2fr_3fr]',
    '70-30': 'grid grid-cols-1 md:grid-cols-[7fr_3fr]',
};

const paddingStyles: Record<string, string> = {
    none: 'py-0',
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20',
    xl: 'py-28',
};

export function CanvasView({
    sections,
    activeSectionId,
    activeBlockId,
    onSelectSection,
    onSelectBlock,
    onEditBlock,
    onInlineEdit,
    availableSections,
}: CanvasViewProps) {
    const __ = useTranslation();
    const getSectionLabel = useCallback(
        (sectionType: string) =>
            availableSections[sectionType]?.label ?? sectionType,
        [availableSections],
    );

    return (
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
            {sections.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
                    <p className="text-muted-foreground">
                        {__('builder.no_sections_yet', 'No sections yet. Add a section from the navigator.')}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {sections.map((section, sectionIndex) => {
                        const variant = section.variant ?? 'light';
                        const layout = section.layout ?? 'contained';
                        const settings = section.settings as Record<
                            string,
                            string
                        > | null;
                        const padding = settings?.padding ?? 'lg';
                        const sectionBg =
                            variantStyles[variant] ?? variantStyles.light;
                        const sectionPad =
                            layout === 'flush'
                                ? ''
                                : (paddingStyles[padding] ?? 'py-12');
                        const containerClass =
                            layoutStyles[layout] ?? layoutStyles.contained;
                        const isActiveSection =
                            section.client_id === activeSectionId;

                        return (
                            <div
                                key={section.client_id}
                                className={cn(
                                    'relative cursor-pointer transition-all',
                                    sectionBg,
                                    sectionPad,
                                    isActiveSection
                                        ? 'ring-2 ring-primary ring-offset-2'
                                        : 'ring-1 ring-border/50 hover:ring-primary/30',
                                )}
                                data-section-type={section.section_type}
                                data-section-id={section.id}
                                onClick={() => onSelectSection(sectionIndex)}
                            >
                                <div className="absolute top-2 left-0 z-10 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {getSectionLabel(section.section_type)}
                                </div>

                                <div className={containerClass}>
                                    {section.blocks
                                        .filter((b) => b.is_active)
                                        .map((block, blockIndex) => {
                                            const isActiveBlock =
                                                block.client_id ===
                                                activeBlockId;

                                            return (
                                                <div
                                                    key={block.client_id}
                                                    className={cn(
                                                        'group relative my-2 rounded border-2 border-transparent p-3 transition-all',
                                                        isActiveBlock
                                                            ? 'border-primary bg-primary/5'
                                                            : 'hover:border-primary/20 hover:bg-primary/5',
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectBlock(
                                                            sectionIndex,
                                                            blockIndex,
                                                        );
                                                    }}
                                                    onDoubleClick={() => {
                                                        onEditBlock(
                                                            sectionIndex,
                                                            blockIndex,
                                                        );
                                                    }}
                                                >
                                                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground hover:bg-primary/90"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEditBlock(
                                                                    sectionIndex,
                                                                    blockIndex,
                                                                );
                                                            }}
                                                        >
                                                            {__('builder.edit', 'Edit')}
                                                        </button>
                                                    </div>
                                                    <CanvasBlockPreview
                                                        block={block}
                                                        onInlineEdit={(
                                                            field,
                                                            value,
                                                        ) =>
                                                            onInlineEdit(
                                                                sectionIndex,
                                                                blockIndex,
                                                                field,
                                                                value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
