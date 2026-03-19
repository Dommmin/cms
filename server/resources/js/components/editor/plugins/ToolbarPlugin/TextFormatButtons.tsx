import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
    Bold,
    Code,
    Italic,
    Strikethrough,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { type JSX } from 'react';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    isSubscript: boolean;
    isSuperscript: boolean;
    isCode: boolean;
    disabled?: boolean;
}

const buttons = [
    { key: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
    { key: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
    {
        key: 'underline',
        icon: UnderlineIcon,
        label: 'Underline',
        shortcut: 'Ctrl+U',
    },
    {
        key: 'strikethrough',
        icon: Strikethrough,
        label: 'Strikethrough',
        shortcut: '',
    },
    { key: 'subscript', icon: SubscriptIcon, label: 'Subscript', shortcut: '' },
    {
        key: 'superscript',
        icon: SuperscriptIcon,
        label: 'Superscript',
        shortcut: '',
    },
    { key: 'code', icon: Code, label: 'Inline Code', shortcut: '' },
] as const;

type FormatKey =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'subscript'
    | 'superscript'
    | 'code';

export default function TextFormatButtons({
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    isSubscript,
    isSuperscript,
    isCode,
    disabled,
}: Props): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const stateMap: Record<FormatKey, boolean> = {
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikethrough: isStrikethrough,
        subscript: isSubscript,
        superscript: isSuperscript,
        code: isCode,
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-0.5">
                {buttons.map(({ key, icon: Icon, label, shortcut }) => (
                    <Tooltip key={key}>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={stateMap[key]}
                                disabled={disabled}
                                onPressedChange={() =>
                                    editor.dispatchCommand(
                                        FORMAT_TEXT_COMMAND,
                                        key,
                                    )
                                }
                                aria-label={label}
                                className="h-8 w-8 p-0"
                            >
                                <Icon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>
                                {label}
                                {shortcut && (
                                    <span className="ml-1 text-muted-foreground">
                                        {shortcut}
                                    </span>
                                )}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
