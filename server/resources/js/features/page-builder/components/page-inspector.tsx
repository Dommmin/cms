import { Box, Layers, MousePointer2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { BlockForm } from './block-form';
import type { PageInspectorProps } from './page-inspector.types';
import { SectionForm } from './section-form';

export function PageInspector({
    section,
    sectionIndex,
    block,
    blockIndex,
    availableSections,
    availableBlockTypes,
    onUpdateSection,
    onUpdateBlock,
    editorMode,
    onClose,
}: PageInspectorProps) {
    const __ = useTranslation();

    if (!section || sectionIndex === null) {
        return (
            <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 text-center text-sm text-muted-foreground">
                <MousePointer2 className="mb-3 h-5 w-5" />
                <p>
                    {__(
                        'builder.inspector_empty',
                        'Select a section or block to edit its settings here.',
                    )}
                </p>
            </div>
        );
    }

    if (block && blockIndex !== null) {
        return (
            <div className="space-y-4 p-3">
                <div className="flex items-center gap-2 border-b pb-3">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold">
                            {__('builder.block_inspector', 'Block settings')}
                        </h2>
                        <p className="truncate text-xs text-muted-foreground">
                            {availableBlockTypes[block.type]?.name ??
                                block.type}
                        </p>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={onClose}
                            title={__(
                                'builder.close_inspector',
                                'Close inspector',
                            )}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <BlockForm
                    block={block}
                    availableBlockTypes={availableBlockTypes}
                    onUpdate={(patch) =>
                        onUpdateBlock(sectionIndex, blockIndex, patch)
                    }
                    onUnlinkReusable={() =>
                        onUpdateBlock(sectionIndex, blockIndex, {
                            reusable_block_id: null,
                            reusable_block_name: null,
                        })
                    }
                    editorMode={editorMode}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4 p-3">
            <div className="flex items-center gap-2 border-b pb-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold">
                        {__('builder.section_inspector', 'Section settings')}
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                        {availableSections[section.section_type]?.label ??
                            section.section_type}
                    </p>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={onClose}
                        title={__('builder.close_inspector', 'Close inspector')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <SectionForm
                section={section}
                availableSections={availableSections}
                onUpdate={(patch) => onUpdateSection(sectionIndex, patch)}
                compact
                editorMode={editorMode}
            />
        </div>
    );
}
