import { AlertCircle, BookMarked, ChevronDown, ChevronRight, Columns2, Columns3, FileText, Hash, Image, Images, Minus, Plus, Smile, Table, Video } from 'lucide-react';
import { Fragment, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { BLOCK_ICONS, BLOCK_LABELS } from './constants';
import type { BlockType, BlockTypeMenuProps, InsertMenuProps } from './types';

const BLOCK_TYPES: BlockType[] = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'code', 'bullet', 'number', 'check'];

export function BlockTypeMenu({ blockType, onSelect }: BlockTypeMenuProps): JSX.Element {
    const __ = useTranslation();

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal">
                            {BLOCK_ICONS[blockType]}
                            <span className="hidden sm:inline">{__(`rte.block_type.${blockType}`, BLOCK_LABELS[blockType])}</span>
                            <ChevronDown size={12} className="opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {__('rte.toolbar.block_type', 'Block type')}
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-44">
                {BLOCK_TYPES.map((type) => (
                    <Fragment key={type}>
                        {(type === 'quote' || type === 'bullet') && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={() => onSelect(type)} className={`gap-2 text-xs ${blockType === type ? 'bg-accent' : ''}`}>
                            <span className="flex w-4 items-center justify-center">{BLOCK_ICONS[type]}</span>
                            {__(`rte.block_type.${type}`, BLOCK_LABELS[type])}
                        </DropdownMenuItem>
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function InsertMenu({
    onInsertHorizontalRule,
    onOpenMediaPicker,
    onOpenGalleryPicker,
    onOpenFilePicker,
    onOpenEmbedDialog,
    onOpenTableDialog,
    onInsertCallout,
    onInsertColumns,
    onInsertCollapsible,
    onOpenSnippetsDialog,
    onOpenEmojiDialog,
    onOpenSpecialCharactersDialog,
}: InsertMenuProps): JSX.Element {
    const __ = useTranslation();

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal">
                            <Plus size={13} />
                            <span className="hidden sm:inline">{__('rte.toolbar.insert', 'Insert')}</span>
                            <ChevronDown size={12} className="opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {__('rte.toolbar.insert_element', 'Insert element')}
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onInsertHorizontalRule}>
                    <Minus size={14} /> {__('rte.insert.horizontal_rule', 'Horizontal Rule')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenMediaPicker}>
                    <Image size={14} /> {__('rte.insert.image', 'Image')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenGalleryPicker}>
                    <Images size={14} /> {__('rte.insert.gallery', 'Gallery')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenFilePicker}>
                    <FileText size={14} /> {__('rte.insert.file', 'File')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenEmbedDialog}>
                    <Video size={14} /> {__('rte.insert.embed', 'Embed')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenSnippetsDialog}>
                    <BookMarked size={14} /> {__('rte.insert.snippets', 'Snippets')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenTableDialog}>
                    <Table size={14} /> {__('rte.insert.table', 'Table')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onInsertCallout}>
                    <AlertCircle size={14} /> {__('rte.insert.callout', 'Callout')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" onClick={() => onInsertColumns('1fr 1fr')}>
                    <Columns2 size={14} /> {__('rte.insert.two_columns', '2 Columns')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={() => onInsertColumns('1fr 1fr 1fr')}>
                    <Columns3 size={14} /> {__('rte.insert.three_columns', '3 Columns')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onInsertCollapsible}>
                    <ChevronRight size={14} /> {__('rte.insert.collapsible_section', 'Collapsible Section')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenEmojiDialog}>
                    <Smile size={14} /> {__('rte.insert.emoji', 'Emoji')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onOpenSpecialCharactersDialog}>
                    <Hash size={14} /> {__('rte.insert.special_characters', 'Special Characters')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
