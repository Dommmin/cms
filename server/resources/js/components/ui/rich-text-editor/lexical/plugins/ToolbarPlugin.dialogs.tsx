import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { extractYouTubeId } from '../../youtube-node';
import { EMOJIS, SPECIAL_CHARS } from './ToolbarPlugin.constants';
import type { CharacterDialogProps, LinkDialogProps, TableDialogProps, YouTubeDialogProps } from './ToolbarPlugin.types';

export function LinkDialog({ open, url, isInvalid, onOpenChange, onUrlChange, onInsert }: LinkDialogProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.link.title', 'Insert link')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="link-url" className="text-xs">
                            {__('rte.dialog.link.url', 'Link URL')}
                        </Label>
                        <Input
                            id="link-url"
                            placeholder="https://, mailto:, tel:, /relative, #anchor"
                            value={url}
                            onChange={(e) => onUrlChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onInsert();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    {isInvalid && <p className="text-xs text-destructive">{__('rte.dialog.link.invalid_url', 'Use https://, mailto:, tel:, /relative or #anchor links.')}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {__('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="button" onClick={onInsert} disabled={isInvalid || url.trim() === ''}>
                        {__('common.insert', 'Insert')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function YouTubeDialog({ open, url, onOpenChange, onUrlChange, onInsert }: YouTubeDialogProps): JSX.Element {
    const __ = useTranslation();
    const canInsert = url.trim() !== '' && extractYouTubeId(url) !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.youtube.title', 'Insert YouTube Video')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="yt-url" className="text-xs">
                            {__('rte.dialog.youtube.url', 'YouTube URL')}
                        </Label>
                        <Input
                            id="yt-url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => onUrlChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onInsert()}
                            autoFocus
                        />
                    </div>
                    {url && !extractYouTubeId(url) && <p className="text-xs text-destructive">{__('rte.dialog.youtube.invalid_url', 'Invalid YouTube URL')}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {__('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="button" onClick={onInsert} disabled={!canInsert}>
                        {__('common.insert', 'Insert')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TableDialog({ open, rows, columns, onOpenChange, onRowsChange, onColumnsChange, onInsert }: TableDialogProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.table.title', 'Insert Table')}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="tbl-rows" className="text-xs">
                            {__('rte.dialog.table.rows', 'Rows')}
                        </Label>
                        <Input id="tbl-rows" type="number" min={1} max={20} value={rows} onChange={(e) => onRowsChange(Number(e.target.value))} autoFocus />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="tbl-cols" className="text-xs">
                            {__('rte.dialog.table.columns', 'Columns')}
                        </Label>
                        <Input id="tbl-cols" type="number" min={1} max={10} value={columns} onChange={(e) => onColumnsChange(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {__('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="button" onClick={onInsert}>
                        {__('common.insert', 'Insert')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function SpecialCharactersDialog({ open, onOpenChange, onSelect }: CharacterDialogProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.special_characters.title', 'Special Characters')}</DialogTitle>
                </DialogHeader>
                <div className="max-h-72 space-y-3 overflow-y-auto py-1">
                    {SPECIAL_CHARS.map((group) => (
                        <div key={group.label}>
                            <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{__(`rte.special_characters.${group.label.toLowerCase()}`, group.label)}</div>
                            <div className="flex flex-wrap gap-0.5">
                                {group.chars.map(({ char, name }) => (
                                    <button
                                        key={`${group.label}-${char}`}
                                        type="button"
                                        title={name}
                                        onClick={() => onSelect(char)}
                                        className="flex h-8 w-8 items-center justify-center rounded font-mono text-sm transition-colors hover:bg-accent"
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function EmojiDialog({ open, onOpenChange, onSelect }: CharacterDialogProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.emoji.title', 'Insert Emoji')}</DialogTitle>
                </DialogHeader>
                <div className="max-h-72 space-y-3 overflow-y-auto py-1">
                    {EMOJIS.map((group) => (
                        <div key={group.label}>
                            <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{__(`rte.emoji.${group.label.toLowerCase()}`, group.label)}</div>
                            <div className="flex flex-wrap gap-0.5">
                                {group.emojis.map((emoji) => (
                                    <button key={emoji} type="button" onClick={() => onSelect(emoji)} className="h-8 w-8 rounded text-lg transition-colors hover:bg-accent" title={emoji}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
