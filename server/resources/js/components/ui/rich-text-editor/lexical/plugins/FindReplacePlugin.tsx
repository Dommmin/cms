import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, COMMAND_PRIORITY_HIGH, KEY_ESCAPE_COMMAND, type LexicalEditor } from 'lexical';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { cn } from '@/lib/utils';

const PATTERN_CACHE = new Map<string, RegExp>();

function getFindRegex(findText: string, matchCase: boolean, wholeWords: boolean): RegExp {
    const key = `${findText}::${matchCase}::${wholeWords}`;
    const cached = PATTERN_CACHE.get(key);
    if (cached) return cached;

    const flags = matchCase ? 'g' : 'gi';
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = wholeWords ? `\\b${escapedFind}\\b` : escapedFind;
    const regex = new RegExp(pattern, flags);
    PATTERN_CACHE.set(key, regex);

    return regex;
}

function countMatches(editor: LexicalEditor, findText: string, matchCase: boolean, wholeWords: boolean): { count: number; current: number } {
    if (!findText.trim()) return { count: 0, current: 0 };

    let result = { count: 0, current: 0 };
    editor.getEditorState().read(() => {
        const root = $getRoot();
        const content = root.getTextContent();
        const regex = getFindRegex(findText, matchCase, wholeWords);
        const matches = content.match(regex);
        result = { count: matches ? matches.length : 0, current: matches ? 1 : 0 };
    });

    return result;
}

export default function FindReplacePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [open, setOpen] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);
    const [matchCase, setMatchCase] = useState(false);
    const [wholeWords, setWholeWords] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const recalcMatches = useCallback((text: string, mc: boolean, ww: boolean) => {
        const { count, current } = countMatches(editor, text, mc, ww);
        setMatchCount(count);
        setCurrentMatch(current);
    }, [editor]);

    const handleFindTextChange = useCallback((value: string) => {
        setFindText(value);
        recalcMatches(value, matchCase, wholeWords);
    }, [matchCase, wholeWords, recalcMatches]);

    const handleMatchCaseChange = useCallback((value: boolean) => {
        setMatchCase(value);
        recalcMatches(findText, value, wholeWords);
    }, [findText, wholeWords, recalcMatches]);

    const handleWholeWordsChange = useCallback((value: boolean) => {
        setWholeWords(value);
        recalcMatches(findText, matchCase, value);
    }, [findText, matchCase, recalcMatches]);

    const refreshAfterReplace = useCallback(() => {
        recalcMatches(findText, matchCase, wholeWords);
    }, [findText, matchCase, wholeWords, recalcMatches]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!open) return editor.registerCommand(
            KEY_ESCAPE_COMMAND,
            () => {
                setOpen(false);
                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );
        return undefined;
    }, [editor, open]);

    const replaceCurrent = useCallback(() => {
        if (!findText.trim()) return;

        editor.update(() => {
            const root = $getRoot();
            const flags = matchCase ? '' : 'i';
            const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordBoundary = wholeWords ? `\\b${escapedFind}\\b` : escapedFind;
            const regex = new RegExp(wordBoundary, flags);

            const allNodes = root.getAllTextNodes();
            for (const node of allNodes) {
                const text = node.getTextContent();
                if (regex.test(text)) {
                    const newText = text.replace(regex, replaceText);
                    node.setTextContent(newText);
                    break;
                }
            }
        });

        setTimeout(refreshAfterReplace, 0);
    }, [editor, findText, replaceText, matchCase, wholeWords, refreshAfterReplace]);

    const replaceAll = useCallback(() => {
        if (!findText.trim()) return;

        editor.update(() => {
            const root = $getRoot();
            const flagsGlobal = matchCase ? 'g' : 'gi';
            const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordBoundary = wholeWords ? `\\b${escapedFind}\\b` : escapedFind;
            const replaceRegex = new RegExp(wordBoundary, flagsGlobal);

            const allNodes = root.getAllTextNodes();
            for (const node of allNodes) {
                const text = node.getTextContent();
                if (replaceRegex.test(text)) {
                    const newText = text.replace(replaceRegex, replaceText);
                    node.setTextContent(newText);
                }
            }
        });

        setTimeout(refreshAfterReplace, 0);
    }, [editor, findText, replaceText, matchCase, wholeWords, refreshAfterReplace]);

    const navigateMatch = useCallback((direction: 'next' | 'prev') => {
        if (matchCount === 0) return;
        const next = direction === 'next'
            ? (currentMatch % matchCount) + 1
            : currentMatch <= 1 ? matchCount : currentMatch - 1;
        setCurrentMatch(next);
    }, [matchCount, currentMatch]);

    if (!open) return null;

    return (
        <div className="absolute right-2 top-2 z-50 flex items-center gap-2 rounded-lg border bg-popover p-2 shadow-lg">
            <div className="flex items-center gap-1">
                <input
                    ref={inputRef}
                    value={findText}
                    onChange={(e) => { handleFindTextChange(e.target.value); }}
                    placeholder="Find"
                    className="h-7 w-36 rounded border bg-background px-2 text-xs"
                    autoFocus
                />
                {matchCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                        {currentMatch}/{matchCount}
                    </span>
                )}
                <button
                    type="button"
                    className="rounded p-1 text-xs hover:bg-accent disabled:opacity-30"
                    onClick={() => navigateMatch('prev')}
                    disabled={matchCount === 0}
                    title="Previous match"
                >
                    ↑
                </button>
                <button
                    type="button"
                    className="rounded p-1 text-xs hover:bg-accent disabled:opacity-30"
                    onClick={() => navigateMatch('next')}
                    disabled={matchCount === 0}
                    title="Next match"
                >
                    ↓
                </button>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
                <input
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replace"
                    className="h-7 w-36 rounded border bg-background px-2 text-xs"
                />
                <button
                    type="button"
                    className="rounded px-1.5 py-0.5 text-xs hover:bg-accent disabled:opacity-30"
                    onClick={replaceCurrent}
                    disabled={matchCount === 0}
                    title="Replace current"
                >
                    Replace
                </button>
                <button
                    type="button"
                    className="rounded px-1.5 py-0.5 text-xs hover:bg-accent disabled:opacity-30"
                    onClick={replaceAll}
                    disabled={matchCount === 0}
                    title="Replace all"
                >
                    All
                </button>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className={cn('rounded p-1 text-xs', matchCase ? 'bg-accent' : 'hover:bg-accent')}
                    onClick={() => handleMatchCaseChange(!matchCase)}
                    title="Match case"
                >
                    Aa
                </button>
                <button
                    type="button"
                    className={cn('rounded p-1 text-xs', wholeWords ? 'bg-accent' : 'hover:bg-accent')}
                    onClick={() => handleWholeWordsChange(!wholeWords)}
                    title="Whole words"
                >
                    W
                </button>
            </div>
            <button
                type="button"
                className="rounded p-1 text-xs hover:bg-accent"
                onClick={() => setOpen(false)}
                title="Close"
            >
                ✕
            </button>
        </div>
    );
}