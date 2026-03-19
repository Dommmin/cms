import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { FileJson, FileText, Trash2, Upload } from 'lucide-react';
import { type JSX } from 'react';
import { useRef } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Props {
    isRichText?: boolean;
}

export default function ActionsPlugin({
    isRichText: _isRichText = true,
}: Props): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const exportJSON = () => {
        const state = JSON.stringify(editor.getEditorState());
        const blob = new Blob([state], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'editor-state.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportHTML = () => {
        let html = '';
        editor.read(() => {
            html = $generateHtmlFromNodes(editor);
        });
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'editor-content.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const state = editor.parseEditorState(text);
                editor.setEditorState(state);
            } catch {
                console.error('Failed to parse editor state');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const clearEditor = () => {
        if (confirm('Are you sure you want to clear the editor content?')) {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }
    };

    const actions = [
        { icon: FileJson, label: 'Export JSON', onClick: exportJSON },
        { icon: FileText, label: 'Export HTML', onClick: exportHTML },
        {
            icon: Upload,
            label: 'Import JSON',
            onClick: () => fileInputRef.current?.click(),
        },
        {
            icon: Trash2,
            label: 'Clear Editor',
            onClick: clearEditor,
            className: 'text-destructive hover:text-destructive',
        },
    ];

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1 border-t bg-muted/30 px-3 py-1.5">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={importJSON}
                    className="hidden"
                />
                <span className="mr-2 text-xs text-muted-foreground">
                    Actions:
                </span>
                {/* eslint-disable-next-line react-hooks/refs */}
                {actions.map(({ icon: Icon, label, onClick, className }) => (
                    <Tooltip key={label}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={onClick}
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground',
                                    className,
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>{label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
