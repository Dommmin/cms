import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState, type JSX } from 'react';
import RteLinkController from '@/actions/App/Http/Controllers/Admin/RteLinkController';
import { analyzeContentHealth, collectInternalLinkUrls, type ContentHealthWarning } from './content-health';

type LinkValidationResponse = {
    results: Array<{
        url: string;
        valid: boolean;
    }>;
};

export default function ContentHealthPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [warnings, setWarnings] = useState<ContentHealthWarning[]>([]);
    const latestJsonRef = useRef<unknown>(null);
    const validationRunRef = useRef(0);
    const validationTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            const editorJson = editorState.toJSON();
            const internalUrls = collectInternalLinkUrls(editorJson);
            const validationRun = validationRunRef.current + 1;

            latestJsonRef.current = editorJson;
            validationRunRef.current = validationRun;
            setWarnings(analyzeContentHealth(editorJson));

            if (validationTimeoutRef.current !== null) {
                window.clearTimeout(validationTimeoutRef.current);
            }

            if (internalUrls.length === 0) return;

            validationTimeoutRef.current = window.setTimeout(() => {
                axios
                    .post<LinkValidationResponse>(RteLinkController.validateUrls.url(), { urls: internalUrls })
                    .then(({ data }) => {
                        if (validationRunRef.current !== validationRun) return;

                        const brokenUrls = new Set(data.results.filter((result) => !result.valid).map((result) => result.url));
                        setWarnings(analyzeContentHealth(latestJsonRef.current, brokenUrls));
                    })
                    .catch(() => {
                        if (validationRunRef.current === validationRun) {
                            setWarnings(analyzeContentHealth(latestJsonRef.current));
                        }
                    });
            }, 300);
        });

        return () => {
            if (validationTimeoutRef.current !== null) {
                window.clearTimeout(validationTimeoutRef.current);
            }

            unregister();
        };
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
