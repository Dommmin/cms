import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractYouTubeId } from '../../youtube-node';
import { EMOJIS, SPECIAL_CHARS } from './ToolbarPlugin.constants';
import type { CharacterDialogProps, TableDialogProps, YouTubeDialogProps } from './ToolbarPlugin.types';

export function YouTubeDialog({ open, url, onOpenChange, onUrlChange, onInsert }: YouTubeDialogProps): JSX.Element {
    const canInsert = url.trim() !== '' && extractYouTubeId(url) !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert YouTube Video</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="yt-url" className="text-xs">
                            YouTube URL
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
                    {url && !extractYouTubeId(url) && <p className="text-xs text-destructive">Invalid YouTube URL</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onInsert} disabled={!canInsert}>
                        Insert
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TableDialog({ open, rows, columns, onOpenChange, onRowsChange, onColumnsChange, onInsert }: TableDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Insert Table</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="tbl-rows" className="text-xs">
                            Rows
                        </Label>
                        <Input id="tbl-rows" type="number" min={1} max={20} value={rows} onChange={(e) => onRowsChange(Number(e.target.value))} autoFocus />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="tbl-cols" className="text-xs">
                            Columns
                        </Label>
                        <Input id="tbl-cols" type="number" min={1} max={10} value={columns} onChange={(e) => onColumnsChange(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onInsert}>
                        Insert
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function SpecialCharactersDialog({ open, onOpenChange, onSelect }: CharacterDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Special Characters</DialogTitle>
                </DialogHeader>
                <div className="max-h-72 space-y-3 overflow-y-auto py-1">
                    {SPECIAL_CHARS.map((group) => (
                        <div key={group.label}>
                            <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</div>
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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Insert Emoji</DialogTitle>
                </DialogHeader>
                <div className="max-h-72 space-y-3 overflow-y-auto py-1">
                    {EMOJIS.map((group) => (
                        <div key={group.label}>
                            <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</div>
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
