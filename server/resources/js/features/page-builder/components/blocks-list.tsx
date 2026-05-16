/**
 * Blocks List Component
 * Sortable list of blocks within a section.
 */

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import axios from 'axios';
import { BookOpen, ClipboardPaste, Plus, SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import type { Block, ReusableBlock } from '../types';
import { BlockCard } from './block-card';
import { BlockForm } from './block-form';
import { BlockTypePicker } from './block-type-picker';
import type { BlocksListProps } from './blocks-list.types';

/** Modal to browse and insert a saved global block */
function LibraryModal({
    open,
    onClose,
    onSelect,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (block: ReusableBlock) => void;
}) {
    const __ = useTranslation();
    const [blocks, setBlocks] = useState<ReusableBlock[]>([]);
    const [filtered, setFiltered] = useState<ReusableBlock[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery('');
            return;
        }
        setTimeout(() => inputRef.current?.focus(), 100);

        setLoading(true);
        axios
            .get<ReusableBlock[]>(ReusableBlockController.library.url())
            .then(({ data }) => {
                const items = Array.isArray(data)
                    ? data
                    : ((data as unknown as { data: ReusableBlock[] }).data ??
                      []);
                setBlocks(items);
                setFiltered(items);
            })
            .catch(() =>
                toast.error(
                    __(
                        'builder.could_not_load_library',
                        'Could not load library',
                    ),
                ),
            )
            .finally(() => setLoading(false));
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const q = query.toLowerCase();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFiltered(
            blocks.filter(
                (b) =>
                    b.name.toLowerCase().includes(q) ||
                    (b.description ?? '').toLowerCase().includes(q),
            ),
        );
    }, [query, blocks]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {__(
                            'builder.global_block_library',
                            'Global Block Library',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {__(
                            'builder.global_block_library_hint',
                            'Insert a previously saved reusable block into this section.',
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={__(
                            'builder.search_blocks',
                            'Search blocks...',
                        )}
                        className="pl-9"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-md border">
                    {loading && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {__('builder.loading', 'Loading...')}
                        </p>
                    )}
                    {!loading && filtered.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {__(
                                'builder.no_blocks_in_library',
                                'No blocks found in library.',
                            )}
                        </p>
                    )}
                    {!loading &&
                        filtered.map((block) => (
                            <button
                                key={block.id}
                                type="button"
                                onClick={() => {
                                    onSelect(block);
                                    onClose();
                                }}
                                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-accent"
                            >
                                <span className="text-sm font-medium">
                                    {block.name}
                                </span>
                                {block.description && (
                                    <span className="text-xs text-muted-foreground">
                                        {block.description}
                                    </span>
                                )}
                                <span className="mt-0.5 text-xs text-muted-foreground/70">
                                    {block.type}
                                </span>
                            </button>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

const CLIPBOARD_KEY_PREFIX = 'pb_clipboard:';
const CLIPBOARD_MAX_BYTES = 1_048_576; // 1 MB
const CLIPBOARD_SCHEMA = 'page-builder:block';
const CLIPBOARD_VERSION = 1;

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
    const clipboardKey = `${CLIPBOARD_KEY_PREFIX}${pageId}`;
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hasClipboard, setHasClipboard] = useState(false);

    // Check clipboard on mount and when storage changes
    useEffect(() => {
        const check = () =>
            setHasClipboard(!!localStorage.getItem(clipboardKey));
        check();
        window.addEventListener('storage', check);
        return () => window.removeEventListener('storage', check);
    }, [clipboardKey]);

    const handleCopyBlock = (blockIndex: number) => {
        const block = blocks[blockIndex];
        const payload = {
            schema: CLIPBOARD_SCHEMA,
            version: CLIPBOARD_VERSION,
            copied_at: new Date().toISOString(),
            block: {
                type: block.type,
                configuration: block.configuration,
                is_active: block.is_active,
                relations: block.relations ?? [],
            },
        };
        const serialized = JSON.stringify(payload);
        if (serialized.length > CLIPBOARD_MAX_BYTES) {
            toast.error(
                __(
                    'builder.block_too_large_to_copy',
                    'Block is too large to copy',
                ),
            );
            return;
        }
        try {
            localStorage.setItem(clipboardKey, serialized);
            setHasClipboard(true);
            toast.success(
                __('builder.block_copied', 'Block copied to clipboard'),
            );
        } catch {
            toast.error(
                __(
                    'builder.block_copy_failed',
                    'Failed to copy block (storage full)',
                ),
            );
        }
    };

    const handlePasteBlock = () => {
        const raw = localStorage.getItem(clipboardKey);
        if (!raw) return;
        try {
            const payload = JSON.parse(raw) as Record<string, unknown>;
            const block = payload.block as Partial<Block> | undefined;

            if (
                payload.schema !== CLIPBOARD_SCHEMA ||
                payload.version !== CLIPBOARD_VERSION ||
                !block ||
                typeof block.type !== 'string' ||
                !Object.prototype.hasOwnProperty.call(
                    availableBlockTypes,
                    block.type,
                ) ||
                (block.configuration !== undefined &&
                    (typeof block.configuration !== 'object' ||
                        block.configuration === null ||
                        Array.isArray(block.configuration))) ||
                (block.relations !== undefined &&
                    !Array.isArray(block.relations))
            ) {
                toast.error(
                    __(
                        'builder.block_paste_invalid',
                        'Clipboard block is not valid for this page.',
                    ),
                );
                return;
            }

            onPasteBlock({
                type: block.type,
                configuration: block.configuration ?? {},
                is_active: block.is_active ?? true,
                relations: block.relations ?? [],
            });
            toast.success(__('builder.block_pasted', 'Block pasted'));
        } catch {
            toast.error(
                __('builder.block_paste_failed', 'Failed to paste block'),
            );
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex(
            (block) => block.client_id === active.id,
        );
        const newIndex = blocks.findIndex(
            (block) => block.client_id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) return;

        onMoveBlock(oldIndex, newIndex);
    };

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

            // Link this block to the newly-created global block
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

    const blockIds = blocks.map(
        (block) => block.client_id ?? `block-${block.id}`,
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                    {__('builder.blocks', 'Blocks')}
                </h4>
                <div className="flex items-center gap-2">
                    {hasClipboard && (
                        <Button
                            onClick={handlePasteBlock}
                            size="sm"
                            variant="outline"
                        >
                            <ClipboardPaste className="mr-2 h-4 w-4" />
                            {__('builder.paste_block', 'Paste Block')}
                        </Button>
                    )}
                    <Button
                        onClick={() => setLibraryOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {__('builder.from_library', 'From Library')}
                    </Button>
                    <Button
                        onClick={() => setPickerOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {__('builder.add_block', 'Add Block')}
                    </Button>
                </div>
            </div>

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
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blockIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {blocks.map((block, blockIndex) => {
                                const isExpanded = expandedBlocks.has(
                                    block.client_id ?? '',
                                );
                                const blockTypeName =
                                    availableBlockTypes[block.type]?.name;

                                return (
                                    <BlockCard
                                        key={block.client_id}
                                        block={block}
                                        blockIndex={blockIndex}
                                        sectionIndex={sectionIndex}
                                        isExpanded={isExpanded}
                                        blockTypeName={blockTypeName}
                                        onToggle={() =>
                                            onToggleBlock(blockIndex)
                                        }
                                        onDelete={() =>
                                            onDeleteBlock(blockIndex)
                                        }
                                        onCopy={() =>
                                            handleCopyBlock(blockIndex)
                                        }
                                        onSaveAsGlobal={(name, desc) =>
                                            handleSaveAsGlobal(
                                                blockIndex,
                                                name,
                                                desc,
                                            )
                                        }
                                    >
                                        <BlockForm
                                            block={block}
                                            availableBlockTypes={
                                                availableBlockTypes
                                            }
                                            onUpdate={(patch) =>
                                                onUpdateBlock(blockIndex, patch)
                                            }
                                            onUnlinkReusable={() =>
                                                handleUnlinkGlobal(blockIndex)
                                            }
                                        />
                                    </BlockCard>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
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
