import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import { analyzeContentHealth, type ContentHealthWarning } from './content-health';

export default function ContentHealthPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [warnings, setWarnings] = useState<ContentHealthWarning[]>([]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            setWarnings(analyzeContentHealth(editorState.toJSON()));
        });
    }, [editor]);

    if (warnings.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <span className="flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Content health
            </span>
            {warnings.slice(0, 4).map((warning, index) => (
                <span key={`${warning.id}-${index}`} className="rounded border border-amber-200 bg-background/60 px-2 py-0.5">
                    {warning.message}
                </span>
            ))}
            {warnings.length > 4 && <span>+{warnings.length - 4} more</span>}
        </div>
    );
}
