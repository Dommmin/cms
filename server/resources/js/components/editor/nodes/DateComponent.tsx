import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { DateComponentProps } from './DateComponent.types';
import { $isDateNode } from './DateNode';

export default function DateComponent({
    isoDate,
    nodeKey,
}: DateComponentProps) {
    const [editor] = useLexicalComposerContext();
    const [open, setOpen] = useState(false);

    const formatted = new Date(isoDate + 'T00:00:00').toLocaleDateString(
        undefined,
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        },
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (!newDate) return;
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isDateNode(node)) node.setDate(newDate);
        });
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <span
                    className="date-node inline-flex cursor-pointer items-center gap-1 rounded border border-dashed border-primary/50 bg-primary/5 px-1.5 py-0.5 text-sm font-medium text-primary select-none hover:bg-primary/10"
                    title="Click to change date"
                >
                    <Calendar className="h-3 w-3 shrink-0" />
                    {formatted}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Change date
                </p>
                <input
                    type="date"
                    value={isoDate}
                    onChange={handleChange}
                    className="block rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
            </PopoverContent>
        </Popover>
    );
}
