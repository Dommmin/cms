import axios from 'axios';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import RteLinkController from '@/actions/App/Http/Controllers/Admin/RteLinkController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { detectEmbed } from '../../../embed-node';
import { EMOJIS, SPECIAL_CHARS } from './constants';
import type { CharacterDialogProps, EmbedDialogProps, InternalLinkSearchResult, LinkDialogProps, LinkDialogTab, SnippetsDialogProps, TableDialogProps } from './types';

export function LinkDialog({ open, url, isInvalid, onOpenChange, onUrlChange, onInternalSelect, onInsert }: LinkDialogProps): JSX.Element {
    const __ = useTranslation();
    const [activeTab, setActiveTab] = useState<LinkDialogTab>('url');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<InternalLinkSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!open || activeTab !== 'internal' || query.trim().length < 2) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setLoading(true);
            axios
                .get<InternalLinkSearchResult[]>(
                    RteLinkController.search.url({
                        query: { q: query, locale: document.documentElement.lang || 'en' },
                    }),
                    { signal: controller.signal },
                )
                .then(({ data }) => setResults(data))
                .catch((error: unknown) => {
                    if (axios.isCancel(error)) return;
                    setResults([]);
                })
                .finally(() => setLoading(false));
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [activeTab, open, query]);

    useEffect(() => {
        if (!open) {
            setActiveTab('url');
            setQuery('');
            setResults([]);
        }
    }, [open]);
    /* eslint-enable react-hooks/set-state-in-effect */

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.link.title', 'Insert link')}</DialogTitle>
                </DialogHeader>
                <div className="flex rounded-md border p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('url')}
                        className={`h-8 flex-1 rounded text-xs font-medium ${activeTab === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        {__('rte.dialog.link.url_tab', 'URL')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('internal')}
                        className={`h-8 flex-1 rounded text-xs font-medium ${activeTab === 'internal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        {__('rte.dialog.link.internal_tab', 'Internal')}
                    </button>
                </div>
                <div className="grid gap-3 py-2">
                    {activeTab === 'url' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="internal-link-search" className="text-xs">
                                {__('rte.dialog.link.search_internal', 'Search pages, products, categories or blog posts')}
                            </Label>
                            <Input id="internal-link-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={__('rte.dialog.link.search_placeholder', 'Search internal content...')} autoFocus />
                            <div className="max-h-64 overflow-y-auto rounded-md border">
                                {loading && <p className="px-3 py-4 text-center text-xs text-muted-foreground">{__('common.loading', 'Loading...')}</p>}
                                {!loading && query.trim().length >= 2 && results.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">{__('common.no_results', 'No results found.')}</p>}
                                {!loading &&
                                    results.map((result) => (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            type="button"
                                            onClick={() => onInternalSelect(result.url)}
                                            className="grid w-full gap-0.5 px-3 py-2 text-left text-xs hover:bg-accent"
                                        >
                                            <span className="font-medium">{result.label}</span>
                                            <span className="text-muted-foreground">{result.meta}</span>
                                            <span className="truncate text-[11px] text-muted-foreground">{result.url}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
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

export function EmbedDialog({ open, url, onOpenChange, onUrlChange, onInsert }: EmbedDialogProps): JSX.Element {
    const __ = useTranslation();
    const detectedEmbed = detectEmbed(url);
    const canInsert = url.trim() !== '' && detectedEmbed !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.embed.title', 'Insert embed')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="embed-url" className="text-xs">
                            {__('rte.dialog.embed.url', 'Embed URL')}
                        </Label>
                        <Input
                            id="embed-url"
                            placeholder="YouTube, Vimeo, Spotify, Loom, TikTok, Instagram or X URL"
                            value={url}
                            onChange={(e) => onUrlChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onInsert()}
                            autoFocus
                        />
                    </div>
                    {url && !detectedEmbed && <p className="text-xs text-destructive">{__('rte.dialog.embed.invalid_url', 'Use a supported HTTPS embed URL from YouTube, Vimeo, Spotify, Loom, TikTok, Instagram or X.')}</p>}
                    {detectedEmbed && <p className="text-xs text-muted-foreground">{__('rte.dialog.embed.detected', 'Detected')}: {detectedEmbed.label}</p>}
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

export function SnippetsDialog({ open, snippets, name, error, onOpenChange, onNameChange, onSaveSelection, onInsert, onDelete }: SnippetsDialogProps): JSX.Element {
    const __ = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{__('rte.dialog.snippets.title', 'Snippets')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2 rounded-md border p-3">
                        <Label htmlFor="snippet-name" className="text-xs">
                            {__('rte.dialog.snippets.name', 'Snippet name')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="snippet-name"
                                value={name}
                                onChange={(event) => onNameChange(event.target.value)}
                                placeholder={__('rte.dialog.snippets.name_placeholder', 'Reusable intro, CTA, disclaimer...')}
                            />
                            <Button type="button" onClick={onSaveSelection}>
                                {__('rte.dialog.snippets.save_selection', 'Save selection')}
                            </Button>
                        </div>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-md border">
                        {snippets.length === 0 ? (
                            <p className="px-3 py-6 text-center text-xs text-muted-foreground">{__('rte.dialog.snippets.empty', 'No snippets saved yet.')}</p>
                        ) : (
                            snippets.map((snippet) => (
                                <div key={snippet.id} className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{snippet.name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(snippet.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <Button type="button" size="sm" variant="outline" onClick={() => onInsert(snippet)}>
                                            {__('common.insert', 'Insert')}
                                        </Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(snippet)}>
                                            {__('common.delete', 'Delete')}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
