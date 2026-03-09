import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Minus, Plus } from 'lucide-react';
import { type JSX } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

interface Props {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

function parseFontSize(value: string): number {
    return parseInt(value.replace('px', ''), 10) || 15;
}

export default function FontSizeInput({ value, disabled, onChange }: Props): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const currentSize = parseFontSize(value);

    const updateFontSize = (newSize: number) => {
        const clamped = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
        const sizeStr = `${clamped}px`;
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { 'font-size': sizeStr });
            }
        });
        onChange(sizeStr);
    };

    return (
        <div className="flex items-center">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled || currentSize <= MIN_FONT_SIZE}
                        onClick={() => updateFontSize(currentSize - 1)}
                        className="flex h-8 w-7 items-center justify-center rounded-l border border-input text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Decrease font size</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <input
                        type="number"
                        value={currentSize}
                        disabled={disabled}
                        min={MIN_FONT_SIZE}
                        max={MAX_FONT_SIZE}
                        onChange={(e) => updateFontSize(parseInt(e.target.value, 10) || currentSize)}
                        className="h-8 w-12 border-y border-input text-center text-sm outline-none focus:ring-0 bg-transparent"
                    />
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Font size</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled || currentSize >= MAX_FONT_SIZE}
                        onClick={() => updateFontSize(currentSize + 1)}
                        className="flex h-8 w-7 items-center justify-center rounded-r border border-input text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Increase font size</p></TooltipContent>
            </Tooltip>
        </div>
    );
}
