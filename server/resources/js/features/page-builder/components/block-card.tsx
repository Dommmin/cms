/**
 * Block Card Component
 * Draggable block with schema-driven form, global block indicator and save-to-library.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    ChevronDown,
    ChevronUp,
    Copy,
    Globe2,
    GripVertical,
    LibraryBig,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Block } from '../types';
import { BlockThumbnail } from './block-thumbnail';
import type { BlockCardProps } from './block-card.types';

export function BlockCard({
    block,
    blockIndex,
    sectionIndex,
    isExpanded,
    blockTypeName,
    onToggle,
    onDelete,
    onCopy,
    onSaveAsGlobal,
    children,
}: BlockCardProps) {
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [globalName, setGlobalName] = useState('');
    const [globalDesc, setGlobalDesc] = useState('');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `block-${sectionIndex}-${blockIndex}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSaveGlobal = () => {
        if (!globalName.trim()) return;
        onSaveAsGlobal?.(globalName.trim(), globalDesc.trim());
        setSaveDialogOpen(false);
        setGlobalName('');
        setGlobalDesc('');
    };

    const displayName =
        block.reusable_block_name ??
        blockTypeName ??
        (block.type.replace(/_/g, ' ') || 'Untitled Block');

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                data-block-id={block.id}
                className={cn(
                    'border-l-4',
                    block.reusable_block_id
                        ? 'border-l-blue-400'
                        : block.is_active
                          ? 'border-l-primary'
                          : 'border-l-muted',
                    isDragging && 'shadow-lg',
                )}
            >
                <CardHeader className="p-3">
                    <div className="flex items-center gap-2">
                        {/* Drag Handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Expand/Collapse */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="h-6 w-6 p-0"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                        </Button>

                        {/* Thumbnail (collapsed only) */}
                        {!isExpanded && (
                            <BlockThumbnail
                                blockType={block.type}
                                className="text-foreground"
                            />
                        )}

                        {/* Icon (expanded only) */}
                        {isExpanded &&
                            (block.reusable_block_id ? (
                                <Globe2 className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                                <Box className="h-3.5 w-3.5 text-muted-foreground" />
                            ))}

                        {/* Block label */}
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={onToggle}
                        >
                            <span className="text-sm font-medium capitalize">
                                {displayName}
                            </span>
                        </div>

                        {/* Global Block badge */}
                        {block.reusable_block_id && (
                            <Badge
                                variant="outline"
                                className="h-5 border-blue-300 text-xs text-blue-600 dark:border-blue-700 dark:text-blue-400"
                            >
                                Global
                            </Badge>
                        )}

                        {/* Active Status */}
                        <Badge
                            variant={block.is_active ? 'default' : 'secondary'}
                            className="h-5 text-xs"
                        >
                            {block.is_active ? 'Active' : 'Hidden'}
                        </Badge>

                        {/* Copy block */}
                        {onCopy && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopy();
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                title="Copy block"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}

                        {/* Save to library */}
                        {onSaveAsGlobal &&
                            !block.reusable_block_id &&
                            block.type && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGlobalName(displayName);
                                        setSaveDialogOpen(true);
                                    }}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                    title="Save as Global Block"
                                >
                                    <LibraryBig className="h-3.5 w-3.5" />
                                </Button>
                            )}

                        {/* Delete */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent className="space-y-4 border-t pt-3">
                        {children}
                    </CardContent>
                )}
            </Card>

            {/* Save as Global Block dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save as Global Block</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">
                            This block will be saved to the Global Block Library
                            and linked here. Any future edits will propagate to
                            all pages that use it.
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="global-name">Name</Label>
                            <Input
                                id="global-name"
                                value={globalName}
                                onChange={(e) => setGlobalName(e.target.value)}
                                placeholder="e.g. Homepage Hero"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="global-desc">
                                Description{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="global-desc"
                                value={globalDesc}
                                onChange={(e) => setGlobalDesc(e.target.value)}
                                placeholder="Short description for the library"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSaveDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveGlobal}
                            disabled={!globalName.trim()}
                        >
                            Save to Library
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
