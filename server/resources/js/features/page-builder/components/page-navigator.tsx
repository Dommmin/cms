import { Box, Copy, Eye, EyeOff, Layers, MousePointer2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { Block, Section } from '../types';
import type { PageNavigatorProps } from './page-navigator.types';

function getSectionLabel(
    section: Section,
    labels: PageNavigatorProps['availableSections'],
): string {
    return labels[section.section_type]?.label ?? section.section_type;
}

function getBlockLabel(
    block: Block,
    labels: PageNavigatorProps['availableBlockTypes'],
): string {
    return block.reusable_block_name ?? labels[block.type]?.name ?? block.type;
}

export function PageNavigator({
    sections,
    availableSections,
    availableBlockTypes,
    activeSectionId,
    activeBlockId,
    onSelectSection,
    onSelectBlock,
    onToggleSectionVisibility,
    onToggleBlockVisibility,
    onDuplicateSection,
    onDuplicateBlock,
}: PageNavigatorProps) {
    const __ = useTranslation();

    return (
        <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] rounded-lg border bg-background lg:block">
            <div className="border-b p-3">
                <div className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">
                        {__('builder.navigator', 'Navigator')}
                    </h2>
                    <Badge variant="secondary" className="ml-auto h-5 text-xs">
                        {sections.length}
                    </Badge>
                </div>
            </div>

            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="space-y-2 p-2">
                    {sections.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">
                            {__(
                                'builder.navigator_empty',
                                'Sections will appear here as you build the page.',
                            )}
                        </p>
                    ) : (
                        sections.map((section, sectionIndex) => {
                            const sectionLabel = getSectionLabel(
                                section,
                                availableSections,
                            );
                            const isActive =
                                activeSectionId === section.client_id &&
                                !activeBlockId;

                            return (
                                <div
                                    key={section.client_id}
                                    className={cn(
                                        'rounded-md border bg-muted/20',
                                        isActive &&
                                            'border-primary bg-primary/5',
                                    )}
                                >
                                    <div className="flex items-center gap-1 p-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectSection(sectionIndex)
                                            }
                                            className="flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                                        >
                                            <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="truncate font-medium">
                                                {sectionLabel}
                                            </span>
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {section.blocks.length}
                                            </span>
                                        </button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onToggleSectionVisibility(
                                                    sectionIndex,
                                                )
                                            }
                                            className="h-7 w-7 p-0"
                                            title={
                                                section.is_active
                                                    ? __(
                                                          'builder.hide_section',
                                                          'Hide section',
                                                      )
                                                    : __(
                                                          'builder.show_section',
                                                          'Show section',
                                                      )
                                            }
                                        >
                                            {section.is_active ? (
                                                <Eye className="h-3.5 w-3.5" />
                                            ) : (
                                                <EyeOff className="h-3.5 w-3.5" />
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onDuplicateSection(sectionIndex)
                                            }
                                            className="h-7 w-7 p-0"
                                            title={__(
                                                'builder.duplicate_section',
                                                'Duplicate section',
                                            )}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    {section.blocks.length > 0 && (
                                        <div className="space-y-1 border-t p-1 pl-4">
                                            {section.blocks.map(
                                                (block, blockIndex) => {
                                                    const blockLabel =
                                                        getBlockLabel(
                                                            block,
                                                            availableBlockTypes,
                                                        );
                                                    const isBlockActive =
                                                        activeBlockId ===
                                                        block.client_id;

                                                    return (
                                                        <div
                                                            key={
                                                                block.client_id
                                                            }
                                                            className={cn(
                                                                'flex items-center gap-1 rounded',
                                                                isBlockActive &&
                                                                    'bg-primary/10',
                                                            )}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    onSelectBlock(
                                                                        sectionIndex,
                                                                        blockIndex,
                                                                    )
                                                                }
                                                                className="flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                                                            >
                                                                <Box className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                <span className="truncate">
                                                                    {blockLabel}
                                                                </span>
                                                            </button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    onToggleBlockVisibility(
                                                                        sectionIndex,
                                                                        blockIndex,
                                                                    )
                                                                }
                                                                className="h-6 w-6 p-0"
                                                                title={
                                                                    block.is_active
                                                                        ? __(
                                                                              'builder.hide_block',
                                                                              'Hide block',
                                                                          )
                                                                        : __(
                                                                              'builder.show_block',
                                                                              'Show block',
                                                                          )
                                                                }
                                                            >
                                                                {block.is_active ? (
                                                                    <Eye className="h-3 w-3" />
                                                                ) : (
                                                                    <EyeOff className="h-3 w-3" />
                                                                )}
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    onDuplicateBlock(
                                                                        sectionIndex,
                                                                        blockIndex,
                                                                    )
                                                                }
                                                                className="h-6 w-6 p-0"
                                                                title={__(
                                                                    'builder.duplicate_block',
                                                                    'Duplicate block',
                                                                )}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </aside>
    );
}
