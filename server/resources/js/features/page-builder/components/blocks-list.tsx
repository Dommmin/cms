/**
 * Blocks List Component
 * Sortable list of blocks within a section.
 */

import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import { useTranslation } from '@/hooks/use-translation';
import { BlockTypePicker } from './block-type-picker';
import { LibraryModal } from './blocks-list/library-modal';
import { BlocksListHeader } from './blocks-list/list-header';
import { SortableBlocks } from './blocks-list/sortable-blocks';
import { useBlockClipboard } from './blocks-list/use-block-clipboard';
import type { BlocksListProps } from './blocks-list.types';

export function BlocksList({
    blocks,
    sectionIndex,
    pageId,
    expandedBlocks,
    availableBlockTypes,
    onAddBlock,
    onAddReusableBlock,
    onPasteBlock,
    onUpdateBlock,
    onDeleteBlock,
    onMoveBlock,
    onToggleBlock,
}: BlocksListProps) {
    const __ = useTranslation();
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const { hasClipboard, copyBlock, pasteBlock } = useBlockClipboard(
        pageId,
        blocks,
        availableBlockTypes,
        onPasteBlock,
    );

    const handleSaveAsGlobal = async (
        blockIndex: number,
        name: string,
        description: string,
    ) => {
        const block = blocks[blockIndex];

        try {
            const { data } = await axios.post(
                ReusableBlockController.store.url(),
                {
                    name,
                    description,
                    type: block.type,
                    configuration: block.configuration,
                    relations_config: block.relations ?? [],
                },
            );

            onUpdateBlock(blockIndex, {
                reusable_block_id: data.id,
                reusable_block_name: data.name,
            });

            toast.success(
                `"${name}" ` +
                    __(
                        'builder.saved_to_library',
                        'saved to Global Block Library',
                    ),
            );
        } catch {
            toast.error(
                __(
                    'builder.save_global_block_failed',
                    'Failed to save global block. Please try again.',
                ),
            );
        }
    };

    const handleUnlinkGlobal = (blockIndex: number) => {
        onUpdateBlock(blockIndex, {
            reusable_block_id: null,
            reusable_block_name: null,
        });
        toast(
            __('builder.block_unlinked', 'Block unlinked from global library'),
            { icon: '✂️' },
        );
    };

    return (
        <div className="space-y-3">
            <BlocksListHeader
                hasClipboard={hasClipboard}
                onPasteBlock={pasteBlock}
                onOpenLibrary={() => setLibraryOpen(true)}
                onOpenPicker={() => setPickerOpen(true)}
            />

            {blocks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        {__(
                            'builder.no_blocks_yet',
                            'No blocks yet. Click "Add Block" to get started.',
                        )}
                    </p>
                </div>
            ) : (
                <SortableBlocks
                    blocks={blocks}
                    sectionIndex={sectionIndex}
                    expandedBlocks={expandedBlocks}
                    availableBlockTypes={availableBlockTypes}
                    onMoveBlock={onMoveBlock}
                    onToggleBlock={onToggleBlock}
                    onDeleteBlock={onDeleteBlock}
                    onCopyBlock={copyBlock}
                    onSaveAsGlobal={handleSaveAsGlobal}
                    onUpdateBlock={onUpdateBlock}
                    onUnlinkGlobal={handleUnlinkGlobal}
                />
            )}

            <LibraryModal
                open={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                onSelect={onAddReusableBlock}
            />

            <BlockTypePicker
                open={pickerOpen}
                availableBlockTypes={availableBlockTypes}
                onSelect={(type) => onAddBlock(type)}
                onClose={() => setPickerOpen(false)}
            />
        </div>
    );
}
