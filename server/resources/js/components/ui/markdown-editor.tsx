import MDEditor, { type ICommand, getCommands } from '@uiw/react-md-editor';
import { FileText } from 'lucide-react';
import { useCallback, useRef, useState, type JSX } from 'react';
import { MediaPickerModal, type MediaItem } from '@/components/media-picker-modal';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { MarkdownEditorProps } from './markdown-editor.types';

export function MarkdownEditor({
    value = '',
    onChange,
    disabled,
    className,
    minHeight = 400,
}: MarkdownEditorProps) {
    const { resolvedAppearance } = useAppearance();
    const __ = useTranslation();
    const [filePickerOpen, setFilePickerOpen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = useCallback(
        (media: MediaItem) => {
            const markdown = `[${media.name}](${media.url})`;
            const textarea = editorRef.current?.querySelector<HTMLTextAreaElement>('textarea.w-md-editor-text-input');
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.substring(0, start) + markdown + value.substring(end);
                onChange?.(newValue);
                requestAnimationFrame(() => {
                    textarea.selectionStart = start + markdown.length;
                    textarea.selectionEnd = start + markdown.length;
                });
            } else {
                onChange?.(value + '\n' + markdown);
            }
            setFilePickerOpen(false);
        },
        [value, onChange],
    );

    const commands = useCallback((): ICommand[] => {
        const defaults = getCommands();
        const linkIndex = defaults.findIndex((cmd) => cmd.name === 'link');
        const insertAt = linkIndex === -1 ? defaults.length : linkIndex + 1;

        const fileCommand: ICommand = {
            name: 'file',
            keyCommand: 'file',
            buttonProps: {
                'aria-label': __('rte.insert.file', 'Insert file'),
                title: __('rte.insert.file', 'Insert file'),
            },
            icon: <FileText size={13} /> as unknown as JSX.Element,
            render: (_command: ICommand, disabled?: boolean): JSX.Element => (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setFilePickerOpen(true)}
                    className="w-md-editor-toolbar-btn"
                    aria-label={__('rte.insert.file', 'Insert file')}
                    title={__('rte.insert.file', 'Insert file')}
                >
                    <FileText size={13} />
                </button>
            ),
        };

        return [...defaults.slice(0, insertAt), fileCommand, ...defaults.slice(insertAt)];
    }, [__]);

    return (
        <div
            ref={editorRef}
            data-color-mode={resolvedAppearance}
            className={cn(
                'rounded-lg border overflow-hidden',
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
        >
            <MDEditor
                value={value}
                onChange={(val) => onChange?.(val ?? '')}
                height={minHeight}
                preview="live"
                commands={commands()}
            />

            <MediaPickerModal
                open={filePickerOpen}
                onClose={() => setFilePickerOpen(false)}
                onSelect={handleFileSelect}
                selectedImages={[]}
                mode="file"
            />
        </div>
    );
}
