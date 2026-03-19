import { $createCodeNode } from '@lexical/code';
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    type LexicalEditor,
} from 'lexical';
import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    List,
    ListChecks,
    ListOrdered,
    Quote,
    Code2,
    Type,
} from 'lucide-react';
import { type JSX } from 'react';
import type { BlockType } from '../../context/ToolbarContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode }[] =
    [
        {
            type: 'paragraph',
            label: 'Normal',
            icon: <Type className="h-4 w-4" />,
        },
        {
            type: 'h1',
            label: 'Heading 1',
            icon: <Heading1 className="h-4 w-4" />,
        },
        {
            type: 'h2',
            label: 'Heading 2',
            icon: <Heading2 className="h-4 w-4" />,
        },
        {
            type: 'h3',
            label: 'Heading 3',
            icon: <Heading3 className="h-4 w-4" />,
        },
        {
            type: 'h4',
            label: 'Heading 4',
            icon: <Heading4 className="h-4 w-4" />,
        },
        {
            type: 'h5',
            label: 'Heading 5',
            icon: <Heading5 className="h-4 w-4" />,
        },
        {
            type: 'bullet',
            label: 'Bulleted List',
            icon: <List className="h-4 w-4" />,
        },
        {
            type: 'number',
            label: 'Numbered List',
            icon: <ListOrdered className="h-4 w-4" />,
        },
        {
            type: 'check',
            label: 'Check List',
            icon: <ListChecks className="h-4 w-4" />,
        },
        { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" /> },
        {
            type: 'code',
            label: 'Code Block',
            icon: <Code2 className="h-4 w-4" />,
        },
    ];

function formatParagraph(editor: LexicalEditor): void {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection))
            $setBlocksType(selection, () => $createParagraphNode());
    });
}

function formatHeading(
    editor: LexicalEditor,
    type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
): void {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection))
            $setBlocksType(selection, () => $createHeadingNode(type));
    });
}

function formatBulletList(editor: LexicalEditor, blockType: BlockType): void {
    if (blockType !== 'bullet')
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
}

function formatNumberedList(editor: LexicalEditor, blockType: BlockType): void {
    if (blockType !== 'number')
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
}

function formatCheckList(editor: LexicalEditor, blockType: BlockType): void {
    if (blockType !== 'check')
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
}

function formatQuote(editor: LexicalEditor): void {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection))
            $setBlocksType(selection, () => $createQuoteNode());
    });
}

function formatCode(editor: LexicalEditor): void {
    editor.update(() => {
        let selection = $getSelection();
        if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
            } else {
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection = $getSelection();
                if ($isRangeSelection(selection))
                    selection.insertRawText(textContent);
            }
        }
    });
}

interface Props {
    blockType: BlockType;
    disabled?: boolean;
}

export default function BlockFormatDropdown({
    blockType,
    disabled,
}: Props): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const currentBlock =
        BLOCK_TYPES.find((b) => b.type === blockType) ?? BLOCK_TYPES[0];

    const handleSelect = (type: BlockType) => {
        switch (type) {
            case 'paragraph':
                formatParagraph(editor);
                break;
            case 'h1':
                formatHeading(editor, 'h1');
                break;
            case 'h2':
                formatHeading(editor, 'h2');
                break;
            case 'h3':
                formatHeading(editor, 'h3');
                break;
            case 'h4':
                formatHeading(editor, 'h4');
                break;
            case 'h5':
                formatHeading(editor, 'h5');
                break;
            case 'bullet':
                formatBulletList(editor, blockType);
                break;
            case 'number':
                formatNumberedList(editor, blockType);
                break;
            case 'check':
                formatCheckList(editor, blockType);
                break;
            case 'quote':
                formatQuote(editor);
                break;
            case 'code':
                formatCode(editor);
                break;
        }
    };

    return (
        <DropDown
            disabled={disabled}
            label={
                <span className="flex min-w-[120px] items-center gap-1.5 text-sm">
                    {currentBlock.icon}
                    {currentBlock.label}
                </span>
            }
            buttonAriaLabel="Formatting options for text style"
            tooltip="Block format"
        >
            {BLOCK_TYPES.map(({ type, label, icon }) => (
                <DropDownItem
                    key={type}
                    onClick={() => handleSelect(type)}
                    active={blockType === type}
                >
                    {icon}
                    <span className="text-sm">{label}</span>
                </DropDownItem>
            ))}
        </DropDown>
    );
}
