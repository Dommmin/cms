import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Baseline, Bold, Code2, Eraser, Highlighter, Italic, Link2, Link2Off, Redo2, SpellCheck, Strikethrough, Subscript, Superscript, Underline, Undo2 } from 'lucide-react';
import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { FONT_FAMILIES, FONT_SIZES, TEXT_COLORS } from './ToolbarPlugin.constants';
import { ToolbarButton as Btn, ToolbarToggle as Tog } from './ToolbarPlugin.controls';
import type { AlignmentGroupProps, FontStyleGroupProps, HistoryGroupProps, InlineFormatGroupProps, LinkGroupProps } from './ToolbarPlugin.types';

export function HistoryGroup({ canUndo, canRedo, onUndo, onRedo }: HistoryGroupProps): JSX.Element {
    const __ = useTranslation();

    return (
        <>
            <Btn onClick={onUndo} disabled={!canUndo} tooltip={__('rte.toolbar.undo', 'Undo (Ctrl+Z)')}>
                <Undo2 size={14} />
            </Btn>
            <Btn onClick={onRedo} disabled={!canRedo} tooltip={__('rte.toolbar.redo', 'Redo (Ctrl+Shift+Z)')}>
                <Redo2 size={14} />
            </Btn>
        </>
    );
}

export function InlineFormatGroup({
    showAdvanced,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    isCode,
    isSubscript,
    isSuperscript,
    isHighlight,
    onBold,
    onItalic,
    onUnderline,
    onStrikethrough,
    onCode,
    onSubscript,
    onSuperscript,
    onHighlight,
    onClearFormatting,
}: InlineFormatGroupProps): JSX.Element {
    const __ = useTranslation();

    return (
        <>
            <Tog pressed={isBold} onPressedChange={onBold} tooltip={__('rte.toolbar.bold', 'Bold (Ctrl+B)')}>
                <Bold size={13} />
            </Tog>
            <Tog pressed={isItalic} onPressedChange={onItalic} tooltip={__('rte.toolbar.italic', 'Italic (Ctrl+I)')}>
                <Italic size={13} />
            </Tog>
            <Tog pressed={isUnderline} onPressedChange={onUnderline} tooltip={__('rte.toolbar.underline', 'Underline (Ctrl+U)')}>
                <Underline size={13} />
            </Tog>
            <Tog pressed={isStrikethrough} onPressedChange={onStrikethrough} tooltip={__('rte.toolbar.strikethrough', 'Strikethrough')}>
                <Strikethrough size={13} />
            </Tog>
            {showAdvanced && (
                <>
                    <Tog pressed={isCode} onPressedChange={onCode} tooltip={__('rte.toolbar.inline_code', 'Inline code')}>
                        <Code2 size={13} />
                    </Tog>
                    <Tog pressed={isSubscript} onPressedChange={onSubscript} tooltip={__('rte.toolbar.subscript', 'Subscript')}>
                        <Subscript size={13} />
                    </Tog>
                    <Tog pressed={isSuperscript} onPressedChange={onSuperscript} tooltip={__('rte.toolbar.superscript', 'Superscript')}>
                        <Superscript size={13} />
                    </Tog>
                    <Tog pressed={isHighlight} onPressedChange={onHighlight} tooltip={__('rte.toolbar.highlight', 'Highlight')}>
                        <Highlighter size={13} />
                    </Tog>
                    <Btn onClick={onClearFormatting} tooltip={__('rte.toolbar.clear_formatting', 'Clear formatting')}>
                        <Eraser size={13} />
                    </Btn>
                </>
            )}
        </>
    );
}

export function FontStyleGroup({
    fontSize,
    fontFamily,
    fontColor,
    spellcheck,
    onFontSizeChange,
    onFontFamilyChange,
    onFontColorChange,
    onResetColor,
    onToggleSpellcheck,
}: FontStyleGroupProps): JSX.Element {
    const __ = useTranslation();

    return (
        <>
            <Select value={fontSize} onValueChange={onFontSizeChange}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SelectTrigger className="h-7 w-14 px-1.5 text-xs">
                            <SelectValue placeholder={__('rte.toolbar.font_size_short', 'Size')} />
                        </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        {__('rte.toolbar.font_size', 'Font size')}
                    </TooltipContent>
                </Tooltip>
                <SelectContent>
                    {FONT_SIZES.map((size) => (
                        <SelectItem key={size} value={`${size}px`} className="text-xs">
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={fontFamily || '__default__'} onValueChange={onFontFamilyChange}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SelectTrigger className="h-7 w-20 px-1.5 text-xs">
                            <SelectValue placeholder={__('rte.toolbar.font_family_short', 'Font')} />
                        </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        {__('rte.toolbar.font_family', 'Font family')}
                    </TooltipContent>
                </Tooltip>
                <SelectContent>
                    {FONT_FAMILIES.map(([value, label]) => (
                        <SelectItem key={value || '__default__'} value={value || '__default__'} className="text-xs">
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="relative h-7 w-7 p-0">
                                <Baseline size={13} />
                                <span className="absolute right-1 bottom-0.5 left-1 h-0.5 rounded-full" style={{ backgroundColor: fontColor || 'currentColor' }} />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        {__('rte.toolbar.text_color', 'Text color')}
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent className="p-2">
                    <div className="grid grid-cols-8 gap-1">
                        {TEXT_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className="h-5 w-5 rounded border border-border transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                                onClick={() => onFontColorChange(color)}
                                title={color}
                            />
                        ))}
                    </div>
                    <DropdownMenuSeparator className="my-1.5" />
                    <button type="button" className="w-full py-0.5 text-center text-xs text-muted-foreground hover:text-foreground" onClick={onResetColor}>
                        {__('rte.toolbar.reset_color', 'Reset color')}
                    </button>
                </DropdownMenuContent>
            </DropdownMenu>

            <Tog pressed={spellcheck} onPressedChange={onToggleSpellcheck} tooltip={__('rte.toolbar.spellcheck', 'Spellcheck')}>
                <SpellCheck size={13} />
            </Tog>
        </>
    );
}

export function AlignmentGroup({ elementFormat, onAlignLeft, onAlignCenter, onAlignRight, onJustify }: AlignmentGroupProps): JSX.Element {
    const __ = useTranslation();

    return (
        <>
            <Tog pressed={elementFormat === 'left'} onPressedChange={onAlignLeft} tooltip={__('rte.toolbar.align_left', 'Align left')}>
                <AlignLeft size={13} />
            </Tog>
            <Tog pressed={elementFormat === 'center'} onPressedChange={onAlignCenter} tooltip={__('rte.toolbar.align_center', 'Align center')}>
                <AlignCenter size={13} />
            </Tog>
            <Tog pressed={elementFormat === 'right'} onPressedChange={onAlignRight} tooltip={__('rte.toolbar.align_right', 'Align right')}>
                <AlignRight size={13} />
            </Tog>
            <Tog pressed={elementFormat === 'justify'} onPressedChange={onJustify} tooltip={__('rte.toolbar.justify', 'Justify')}>
                <AlignJustify size={13} />
            </Tog>
        </>
    );
}

export function LinkGroup({ isLink, onToggleLink }: LinkGroupProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Tog pressed={isLink} onPressedChange={onToggleLink} tooltip={isLink ? __('rte.toolbar.remove_link', 'Remove link') : __('rte.toolbar.insert_link', 'Insert link')}>
            {isLink ? <Link2Off size={13} /> : <Link2 size={13} />}
        </Tog>
    );
}
