import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useEffect, useState, type JSX } from 'react';

export default function WordCountPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [counts, setCounts] = useState({ chars: 0, words: 0 });

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const text = $getRoot().getTextContent();
                const chars = text.length;
                const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
                setCounts({ chars, words });
            });
        });
    }, [editor]);

    return (
        <div className="flex items-center justify-end gap-3 border-t border-border px-3 py-1.5 text-xs text-muted-foreground select-none">
            <span>{counts.words} {counts.words === 1 ? 'word' : 'words'}</span>
            <span className="text-border">·</span>
            <span>{counts.chars} {counts.chars === 1 ? 'character' : 'characters'}</span>
        </div>
    );
}
