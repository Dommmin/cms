import axios from 'axios';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import type { ReusableBlock } from '../../types';
import type { LibraryModalProps } from '../blocks-list.types';

export function LibraryModal({ open, onClose, onSelect }: LibraryModalProps) {
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
                (block) =>
                    block.name.toLowerCase().includes(q) ||
                    (block.description ?? '').toLowerCase().includes(q),
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
