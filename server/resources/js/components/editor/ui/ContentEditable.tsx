import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { type JSX } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    className?: string;
    placeholder?: string;
}

export default function LexicalContentEditable({
    className,
    placeholder: _placeholder,
}: Props): JSX.Element {
    return (
        <ContentEditable
            className={cn(
                'ContentEditable__root min-h-[400px] p-4 leading-relaxed text-foreground outline-none',
                className,
            )}
        />
    );
}
