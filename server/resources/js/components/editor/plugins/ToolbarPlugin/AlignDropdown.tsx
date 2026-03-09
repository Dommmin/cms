import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_ELEMENT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, type ElementFormatType } from 'lexical';
import {
    AlignCenter, AlignJustify, AlignLeft, AlignRight,
    IndentDecrease, IndentIncrease
} from 'lucide-react';
import { type JSX } from 'react';
import DropDown, { DropDownItem } from '../../ui/DropDown';

interface Props {
    elementFormat: string;
    disabled?: boolean;
}

const ALIGN_OPTIONS = [
    { format: 'left' as ElementFormatType, label: 'Left Align', icon: <AlignLeft className="h-4 w-4" /> },
    { format: 'center' as ElementFormatType, label: 'Center Align', icon: <AlignCenter className="h-4 w-4" /> },
    { format: 'right' as ElementFormatType, label: 'Right Align', icon: <AlignRight className="h-4 w-4" /> },
    { format: 'justify' as ElementFormatType, label: 'Justify Align', icon: <AlignJustify className="h-4 w-4" /> },
];

export default function AlignDropdown({ elementFormat, disabled }: Props): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const current = ALIGN_OPTIONS.find((a) => a.format === elementFormat) ?? ALIGN_OPTIONS[0];

    return (
        <DropDown
            disabled={disabled}
            label={current.icon}
            buttonAriaLabel="Formatting options for text alignment"
            tooltip="Text alignment"
        >
            {ALIGN_OPTIONS.map(({ format, label, icon }) => (
                <DropDownItem
                    key={format}
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format)}
                    active={elementFormat === format}
                >
                    {icon}
                    <span className="text-sm">{label}</span>
                </DropDownItem>
            ))}
            <div className="my-1 border-t border-border" />
            <DropDownItem onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>
                <IndentDecrease className="h-4 w-4" />
                <span className="text-sm">Outdent</span>
            </DropDownItem>
            <DropDownItem onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>
                <IndentIncrease className="h-4 w-4" />
                <span className="text-sm">Indent</span>
            </DropDownItem>
        </DropDown>
    );
}
