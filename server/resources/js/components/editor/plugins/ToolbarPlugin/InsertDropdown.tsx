import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import axios from 'axios';
import {
    Calendar,
    Image as ImageIcon,
    Minus,
    Table as TableIcon,
    Youtube,
    Plus,
    FileText,
    Columns,
    ChevronRight,
    Twitter,
    Figma,
    Search,
} from 'lucide-react';
import { type JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { $createImageNode } from '../../nodes/ImageNode';
import { $createYouTubeNode } from '../../nodes/YouTubeNode';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import Modal from '../../ui/Modal';
import TextInput from '../../ui/TextInput';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import { INSERT_DATE_COMMAND } from '../DatePlugin';
import { INSERT_FIGMA_COMMAND } from '../FigmaPlugin';
import { INSERT_LAYOUT_COMMAND } from '../LayoutPlugin/LayoutPlugin';
import { INSERT_PAGE_BREAK_COMMAND } from '../PageBreakPlugin';
import { INSERT_TWEET_COMMAND } from '../TwitterPlugin';
import type {
    MediaItem,
    MediaResponse,
    ModalType,
    InsertDropdownProps,
} from './InsertDropdown.types';

// ─── Media picker for image insertion ─────────────────────────────────────────

function InsertImageFromMedia({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [media, setMedia] = useState<MediaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [_page, setPage] = useState(1);
    const searchRef = useRef(search);

    useEffect(() => {
        searchRef.current = search;
    }, [search]);

    const fetchMedia = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p) });
            if (searchRef.current) params.set('search', searchRef.current);
            const res = await axios.get(`/admin/media/search?${params}`);
            setMedia(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia(1);
    }, [fetchMedia]);

    const handleSearch = (value: string) => {
        setSearch(value);
        const t = setTimeout(() => {
            setPage(1);
            fetchMedia(1);
        }, 300);
        return () => clearTimeout(t);
    };

    const insertMedia = (item: MediaItem) => {
        editor.update(() => {
            $insertNodeToNearestRoot(
                $createImageNode({
                    src: item.url,
                    altText: item.name,
                    maxWidth: 700,
                }),
            );
        });
        onClose();
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    className="w-full rounded border border-input bg-background py-1.5 pr-3 pl-8 text-sm outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Search media…"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="max-h-[380px] min-h-[200px] overflow-y-auto">
                {loading ? (
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square animate-pulse rounded-lg bg-muted"
                            />
                        ))}
                    </div>
                ) : !media?.data.length ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <ImageIcon className="mb-2 h-8 w-8" />
                        <p className="text-sm">No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {media.data.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => insertMedia(item)}
                                className="group relative aspect-square overflow-hidden rounded-lg border border-transparent transition-all hover:border-primary hover:ring-2 hover:ring-primary/40"
                                title={item.name}
                            >
                                {item.mime_type.startsWith('image/') ? (
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                        {item.name}
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <p className="truncate text-[10px] text-white">
                                        {item.name}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {media && media.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <button
                        type="button"
                        disabled={!media.prev_page_url}
                        onClick={() => {
                            setPage((p) => {
                                fetchMedia(p - 1);
                                return p - 1;
                            });
                        }}
                        className="rounded border border-input px-3 py-1 hover:bg-muted disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="text-muted-foreground">
                        Page {media.current_page} / {media.last_page}
                    </span>
                    <button
                        type="button"
                        disabled={!media.next_page_url}
                        onClick={() => {
                            setPage((p) => {
                                fetchMedia(p + 1);
                                return p + 1;
                            });
                        }}
                        className="rounded border border-input px-3 py-1 hover:bg-muted disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* URL fallback */}
            <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground select-none hover:text-foreground">
                    Or insert by URL
                </summary>
                <InsertImageByUrl onClose={onClose} editor={editor} />
            </details>
        </div>
    );
}

function InsertImageByUrl({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');
    const onClick = () => {
        if (!src) return;
        editor.update(() => {
            $insertNodeToNearestRoot(
                $createImageNode({ src, altText, maxWidth: 700 }),
            );
        });
        onClose();
    };
    return (
        <div className="mt-2 flex flex-col gap-2">
            <TextInput
                label="Image URL"
                value={src}
                onChange={setSrc}
                placeholder="https://…"
                type="url"
            />
            <TextInput
                label="Alt text"
                value={altText}
                onChange={setAltText}
                placeholder="Image description"
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onClick}
                    disabled={!src}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

function InsertDateDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);

    const onClick = () => {
        editor.dispatchCommand(INSERT_DATE_COMMAND, date);
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Select date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

function InsertTableDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [rows, setRows] = useState('3');
    const [cols, setCols] = useState('3');

    const onClick = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows, columns: cols });
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <TextInput
                label="Rows"
                value={rows}
                onChange={setRows}
                type="number"
            />
            <TextInput
                label="Columns"
                value={cols}
                onChange={setCols}
                type="number"
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

function InsertYouTubeDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [url, setUrl] = useState('');

    const extractVideoID = (u: string): string | null => {
        const regex =
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = regex.exec(u);
        return match ? match[1] : null;
    };

    const onClick = () => {
        const videoID = extractVideoID(url);
        if (!videoID) return;
        editor.update(() => {
            $insertNodeToNearestRoot($createYouTubeNode(videoID));
        });
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <TextInput
                label="YouTube URL"
                value={url}
                onChange={setUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={!url}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

function InsertTweetDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [url, setUrl] = useState('');

    const extractTweetID = (u: string): string | null => {
        const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
        const match = regex.exec(u);
        return match ? match[1] : null;
    };

    const onClick = () => {
        const tweetID = extractTweetID(url);
        if (!tweetID) return;
        editor.dispatchCommand(INSERT_TWEET_COMMAND, tweetID);
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <TextInput
                label="Tweet / X URL"
                value={url}
                onChange={setUrl}
                placeholder="https://x.com/user/status/..."
                type="url"
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={!url}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

function InsertFigmaDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [url, setUrl] = useState('');

    const onClick = () => {
        if (!url) return;
        editor.dispatchCommand(INSERT_FIGMA_COMMAND, url);
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <TextInput
                label="Figma URL"
                value={url}
                onChange={setUrl}
                placeholder="https://www.figma.com/file/..."
                type="url"
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={!url}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

const COLUMN_LAYOUTS = [
    { label: '2 columns (equal)', value: '1fr 1fr' },
    { label: '2 columns (2:1)', value: '2fr 1fr' },
    { label: '2 columns (1:2)', value: '1fr 2fr' },
    { label: '3 columns (equal)', value: '1fr 1fr 1fr' },
    { label: '3 columns (4:2:4)', value: '2fr 1fr 2fr' },
];

function InsertColumnsDialog({
    onClose,
    editor,
}: {
    onClose: () => void;
    editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
    const [layout, setLayout] = useState('1fr 1fr');

    const onClick = () => {
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
        onClose();
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Layout</label>
                <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                >
                    {COLUMN_LAYOUTS.map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClick}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                >
                    Insert
                </button>
            </div>
        </div>
    );
}

export default function InsertDropdown({
    disabled,
}: InsertDropdownProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [modal, setModal] = useState<ModalType>(null);

    return (
        <>
            <DropDown
                disabled={disabled}
                label={
                    <span className="flex items-center gap-1 text-sm">
                        <Plus className="h-4 w-4" />
                        Insert
                    </span>
                }
                buttonAriaLabel="Insert specialized editor node"
                tooltip="Insert element"
            >
                <DropDownItem onClick={() => setModal('date')}>
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date</span>
                </DropDownItem>
                <DropDownItem
                    onClick={() =>
                        editor.dispatchCommand(
                            INSERT_HORIZONTAL_RULE_COMMAND,
                            undefined,
                        )
                    }
                >
                    <Minus className="h-4 w-4" />
                    <span className="text-sm">Horizontal Rule</span>
                </DropDownItem>
                <DropDownItem
                    onClick={() =>
                        editor.dispatchCommand(
                            INSERT_PAGE_BREAK_COMMAND,
                            undefined,
                        )
                    }
                >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Page Break</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('image')}>
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">Image</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('table')}>
                    <TableIcon className="h-4 w-4" />
                    <span className="text-sm">Table</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('columns')}>
                    <Columns className="h-4 w-4" />
                    <span className="text-sm">Columns Layout</span>
                </DropDownItem>
                <DropDownItem
                    onClick={() =>
                        editor.dispatchCommand(
                            INSERT_COLLAPSIBLE_COMMAND,
                            undefined,
                        )
                    }
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-sm">Collapsible container</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('tweet')}>
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">X (Tweet)</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('youtube')}>
                    <Youtube className="h-4 w-4" />
                    <span className="text-sm">YouTube Video</span>
                </DropDownItem>
                <DropDownItem onClick={() => setModal('figma')}>
                    <Figma className="h-4 w-4" />
                    <span className="text-sm">Figma Document</span>
                </DropDownItem>
            </DropDown>

            {modal === 'date' && (
                <Modal
                    title="Insert Date"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertDateDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'image' && (
                <Modal
                    title="Insert Image"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                    className="sm:max-w-2xl"
                >
                    <InsertImageFromMedia
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'table' && (
                <Modal
                    title="Insert Table"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertTableDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'youtube' && (
                <Modal
                    title="Insert YouTube Video"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertYouTubeDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'tweet' && (
                <Modal
                    title="Insert X (Tweet)"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertTweetDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'figma' && (
                <Modal
                    title="Insert Figma Document"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertFigmaDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
            {modal === 'columns' && (
                <Modal
                    title="Insert Columns Layout"
                    onClose={() => setModal(null)}
                    closeOnClickOutside
                >
                    <InsertColumnsDialog
                        onClose={() => setModal(null)}
                        editor={editor}
                    />
                </Modal>
            )}
        </>
    );
}
