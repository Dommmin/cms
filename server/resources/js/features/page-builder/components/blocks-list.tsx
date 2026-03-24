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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Block, BlockTypeConfig, ReusableBlock } from '../types';
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
            .get<ReusableBlock[]>('/admin/cms/reusable-blocks/library')
            .then(({ data }) => {
                const items = Array.isArray(data)
                    ? data
                    : ((data as unknown as { data: ReusableBlock[] }).data ??
                      []);
                setBlocks(items);
                setFiltered(items);
            })
            .catch(() => toast.error('Could not load library'))
            .finally(() => setLoading(false));
    }, [open]);

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
                    <DialogTitle>Global Block Library</DialogTitle>
                    <DialogDescription>
                        Insert a previously saved reusable block into this
                        section.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search blocks..."
                        className="pl-9"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-md border">
                    {loading && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Loading...
                        </p>
                    )}
                    {!loading && filtered.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No blocks found in library.
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

const CLIPBOARD_KEY = 'pb_clipboard';

export function BlocksList({
    blocks,
    sectionIndex,
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
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hasClipboard, setHasClipboard] = useState(false);

    // Check clipboard on mount and when storage changes
    useEffect(() => {
        const check = () =>
            setHasClipboard(!!localStorage.getItem(CLIPBOARD_KEY));
        check();
        window.addEventListener('storage', check);
        return () => window.removeEventListener('storage', check);
    }, []);

    const handleCopyBlock = (blockIndex: number) => {
        const block = blocks[blockIndex];
        const payload = {
            type: block.type,
            configuration: block.configuration,
            is_active: block.is_active,
            relations: block.relations ?? [],
        };
        localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(payload));
        setHasClipboard(true);
        toast.success('Block copied to clipboard');
    };

    const handlePasteBlock = () => {
        const raw = localStorage.getItem(CLIPBOARD_KEY);
        if (!raw) return;
        try {
            const payload = JSON.parse(raw) as Partial<Block>;
            onPasteBlock({
                type: payload.type ?? '',
                configuration: payload.configuration ?? {},
                is_active: payload.is_active ?? true,
                relations: payload.relations ?? [],
            });
            toast.success('Block pasted');
        } catch {
            toast.error('Failed to paste block');
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = Number(String(active.id).split('-')[2]);
        const newIndex = Number(String(over.id).split('-')[2]);

        onMoveBlock(oldIndex, newIndex);
    };

    const handleSaveAsGlobal = async (
        blockIndex: number,
        name: string,
        description: string,
    ) => {
        const block = blocks[blockIndex];

        try {
            const { data } = await axios.post('/admin/cms/reusable-blocks', {
                name,
                description,
                type: block.type,
                configuration: block.configuration,
                relations_config: block.relations ?? [],
            });

            // Link this block to the newly-created global block
            onUpdateBlock(blockIndex, {
                reusable_block_id: data.id,
                reusable_block_name: data.name,
            });

            toast.success(`"${name}" saved to Global Block Library`);
        } catch {
            toast.error('Failed to save global block. Please try again.');
        }
    };

    const handleUnlinkGlobal = (blockIndex: number) => {
        onUpdateBlock(blockIndex, {
            reusable_block_id: null,
            reusable_block_name: null,
        });
        toast('Block unlinked from global library', { icon: '✂️' });
    };

    const blockIds = blocks.map((_, index) => `block-${sectionIndex}-${index}`);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Blocks</h4>
                <div className="flex items-center gap-2">
                    {hasClipboard && (
                        <Button
                            onClick={handlePasteBlock}
                            size="sm"
                            variant="outline"
                        >
                            <ClipboardPaste className="mr-2 h-4 w-4" />
                            Paste Block
                        </Button>
                    )}
                    <Button
                        onClick={() => setLibraryOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        From Library
                    </Button>
                    <Button
                        onClick={() => setPickerOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Block
                    </Button>
                </div>
            </div>

            {blocks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No blocks yet. Click "Add Block" to get started.
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
                                const blockKey = `${sectionIndex}-${blockIndex}`;
                                const isExpanded = expandedBlocks.has(blockKey);
                                const blockTypeName =
                                    availableBlockTypes[block.type]?.name;

                                return (
                                    <BlockCard
                                        key={blockIndex}
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
