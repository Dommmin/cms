import MDEditor from '@uiw/react-md-editor';
import { useAppearance } from '@/hooks/use-appearance';
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

    return (
        <div
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
            />
        </div>
    );
}
