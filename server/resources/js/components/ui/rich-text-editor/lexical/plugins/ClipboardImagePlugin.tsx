import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, PASTE_COMMAND } from 'lexical';
import { useCallback, useEffect, type JSX } from 'react';
import { $createImageNode } from '../../image-node';

async function uploadClipboardImage(file: File): Promise<{
    id: number;
    url: string;
    alt: string;
} | null> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/panel/media/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });

        if (!response.ok) return null;

        const data = await response.json();
        const media = Array.isArray(data) ? data[0] : data;

        if (!media?.id || !media?.url) return null;

        return {
            id: media.id,
            url: media.url,
            alt: media.alt || media.name || '',
        };
    } catch {
        return null;
    }
}

export default function ClipboardImagePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    const handlePaste = useCallback((event: ClipboardEvent) => {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;

        const imageFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                imageFiles.push(files[i]);
            }
        }

        if (imageFiles.length === 0) return false;

        event.preventDefault();

        for (const file of imageFiles) {
            uploadClipboardImage(file).then((result) => {
                if (!result) return;
                editor.update(() => {
                    $insertNodes([
                        $createImageNode({
                            src: result.url,
                            altText: result.alt,
                            mediaId: result.id,
                            loading: 'lazy',
                        }),
                    ]);
                });
            });
        }

        return true;
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            PASTE_COMMAND,
            handlePaste as (event: ClipboardEvent) => boolean,
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor, handlePaste]);

    return null;
}