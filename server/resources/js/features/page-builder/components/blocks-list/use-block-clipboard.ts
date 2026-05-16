import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { Block, BlockTypeConfig } from '../../types';

const CLIPBOARD_KEY_PREFIX = 'pb_clipboard:';
const CLIPBOARD_MAX_BYTES = 1_048_576;
const CLIPBOARD_SCHEMA = 'page-builder:block';
const CLIPBOARD_VERSION = 1;

export function useBlockClipboard(
    pageId: number,
    blocks: Block[],
    availableBlockTypes: Record<string, BlockTypeConfig>,
    onPasteBlock: (patch: Partial<Block>) => void,
) {
    const __ = useTranslation();
    const clipboardKey = `${CLIPBOARD_KEY_PREFIX}${pageId}`;
    const [hasClipboard, setHasClipboard] = useState(false);

    useEffect(() => {
        const check = () =>
            setHasClipboard(!!localStorage.getItem(clipboardKey));

        check();
        window.addEventListener('storage', check);

        return () => window.removeEventListener('storage', check);
    }, [clipboardKey]);

    const copyBlock = (blockIndex: number) => {
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

    const pasteBlock = () => {
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

    return { hasClipboard, copyBlock, pasteBlock };
}
