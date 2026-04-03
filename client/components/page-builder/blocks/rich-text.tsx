import { sanitizeHtml } from '@/lib/sanitize';
import type { RichTextConfig, RichTextProps } from './rich-text.types';

export function RichTextBlock({ block }: RichTextProps) {
    const cfg = block.configuration as RichTextConfig;

    const proseSize = {
        sm: 'prose-sm',
        base: '',
        lg: 'prose-lg',
        xl: 'prose-xl',
    }[cfg.text_size ?? 'base'];

    if (!cfg.content) return null;

    return (
        <div
            className={`prose dark:prose-invert max-w-none ${proseSize}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(cfg.content) }}
        />
    );
}
