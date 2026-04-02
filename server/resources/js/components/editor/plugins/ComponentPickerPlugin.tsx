import { $createCodeNode } from '@lexical/code';
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    type LexicalEditor,
} from 'lexical';
import {
    Calendar,
    ChevronRight,
    Code2,
    Columns,
    Figma,
    FileText,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListChecks,
    ListOrdered,
    Minus,
    Quote,
    Table,
    Twitter,
    Type,
    Youtube,
} from 'lucide-react';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { $createYouTubeNode } from '../nodes/YouTubeNode';
import { INSERT_COLLAPSIBLE_COMMAND } from './CollapsiblePlugin';
import { INSERT_DATE_COMMAND } from './DatePlugin';
import { INSERT_FIGMA_COMMAND } from './FigmaPlugin';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin/LayoutPlugin';
import { INSERT_PAGE_BREAK_COMMAND } from './PageBreakPlugin';
import { INSERT_TWEET_COMMAND } from './TwitterPlugin';

class ComponentPickerOption extends MenuOption {
    title: string;
    icon?: JSX.Element;
    keywords: string[];
    keyboardShortcut?: string;
    onSelect: (queryString: string) => void;

    constructor(
        title: string,
        options: {
            icon?: JSX.Element;
            keywords?: string[];
            keyboardShortcut?: string;
            onSelect: (queryString: string) => void;
        },
    ) {
        super(title);
        this.title = title;
        this.keywords = options.keywords || [];
        this.icon = options.icon;
        this.keyboardShortcut = options.keyboardShortcut;
        this.onSelect = options.onSelect.bind(this);
    }
}

/* eslint-disable react-hooks/refs */
function ComponentPickerMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: ComponentPickerOption;
}) {
    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={`component-picker-item flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={`typeahead-item-${index}`}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <span className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-muted-foreground">
                {option.icon}
            </span>
            <div>
                <p className="font-medium">{option.title}</p>
            </div>
        </li>
    );
}
/* eslint-enable react-hooks/refs */

function promptUrl(label: string): string | null {
    return window.prompt(`${label} URL:`);
}

function extractYouTubeId(url: string): string | null {
    const m = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(
        url,
    );
    return m ? m[1] : null;
}

function extractTweetId(url: string): string | null {
    const m = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/.exec(url);
    return m ? m[1] : null;
}

function getBaseOptions(editor: LexicalEditor): ComponentPickerOption[] {
    return [
        new ComponentPickerOption('Paragraph', {
            icon: <Type className="h-4 w-4" />,
            keywords: ['normal', 'paragraph', 'p', 'text'],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection))
                        $setBlocksType(selection, () => $createParagraphNode());
                }),
        }),
        ...(['h1', 'h2', 'h3'] as const).map(
            (tag, i) =>
                new ComponentPickerOption(`Heading ${i + 1}`, {
                    icon:
                        i === 0 ? (
                            <Heading1 className="h-4 w-4" />
                        ) : i === 1 ? (
                            <Heading2 className="h-4 w-4" />
                        ) : (
                            <Heading3 className="h-4 w-4" />
                        ),
                    keywords: ['heading', 'header', `h${i + 1}`],
                    onSelect: () =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection))
                                $setBlocksType(selection, () =>
                                    $createHeadingNode(tag),
                                );
                        }),
                }),
        ),
        new ComponentPickerOption('Bulleted List', {
            icon: <List className="h-4 w-4" />,
            keywords: ['bulleted list', 'unordered list', 'ul'],
            onSelect: () =>
                editor.dispatchCommand(
                    INSERT_UNORDERED_LIST_COMMAND,
                    undefined,
                ),
        }),
        new ComponentPickerOption('Numbered List', {
            icon: <ListOrdered className="h-4 w-4" />,
            keywords: ['numbered list', 'ordered list', 'ol'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
        }),
        new ComponentPickerOption('Check List', {
            icon: <ListChecks className="h-4 w-4" />,
            keywords: ['check list', 'todo list', 'checklist'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
        }),
        new ComponentPickerOption('Quote', {
            icon: <Quote className="h-4 w-4" />,
            keywords: ['block quote', 'quote', 'blockquote'],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection))
                        $setBlocksType(selection, () => $createQuoteNode());
                }),
        }),
        new ComponentPickerOption('Code Block', {
            icon: <Code2 className="h-4 w-4" />,
            keywords: ['javascript', 'python', 'js', 'ts', 'codeblock', 'code'],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection))
                        $setBlocksType(selection, () => $createCodeNode());
                }),
        }),
        new ComponentPickerOption('Divider', {
            icon: <Minus className="h-4 w-4" />,
            keywords: ['horizontal rule', 'divider', 'hr', 'line'],
            onSelect: () =>
                editor.dispatchCommand(
                    INSERT_HORIZONTAL_RULE_COMMAND,
                    undefined,
                ),
        }),
        new ComponentPickerOption('Page Break', {
            icon: <FileText className="h-4 w-4" />,
            keywords: ['page break', 'pagebreak', 'break'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_PAGE_BREAK_COMMAND, undefined),
        }),
        new ComponentPickerOption('Table', {
            icon: <Table className="h-4 w-4" />,
            keywords: ['grid', 'spreadsheet', 'rows', 'columns', 'table'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                    rows: '3',
                    columns: '3',
                }),
        }),
        new ComponentPickerOption('Columns Layout', {
            icon: <Columns className="h-4 w-4" />,
            keywords: ['columns', 'layout', 'grid', 'two columns'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_LAYOUT_COMMAND, '1fr 1fr'),
        }),
        new ComponentPickerOption('Collapsible', {
            icon: <ChevronRight className="h-4 w-4" />,
            keywords: ['collapsible', 'accordion', 'toggle', 'details'],
            onSelect: () =>
                editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
        }),
        new ComponentPickerOption('Date', {
            icon: <Calendar className="h-4 w-4" />,
            keywords: ['date', 'today', 'time', 'calendar'],
            onSelect: () =>
                editor.dispatchCommand(
                    INSERT_DATE_COMMAND,
                    new Date().toISOString().slice(0, 10),
                ),
        }),
        new ComponentPickerOption('YouTube Video', {
            icon: <Youtube className="h-4 w-4" />,
            keywords: ['youtube', 'video', 'embed'],
            onSelect: () => {
                const url = promptUrl('YouTube');
                if (!url) return;
                const id = extractYouTubeId(url);
                if (id)
                    editor.update(() => {
                        $insertNodeToNearestRoot($createYouTubeNode(id));
                    });
            },
        }),
        new ComponentPickerOption('X (Tweet)', {
            icon: <Twitter className="h-4 w-4" />,
            keywords: ['twitter', 'tweet', 'x', 'embed'],
            onSelect: () => {
                const url = promptUrl('Tweet / X');
                if (!url) return;
                const id = extractTweetId(url);
                if (id) editor.dispatchCommand(INSERT_TWEET_COMMAND, id);
            },
        }),
        new ComponentPickerOption('Figma Document', {
            icon: <Figma className="h-4 w-4" />,
            keywords: ['figma', 'design', 'embed'],
            onSelect: () => {
                const url = promptUrl('Figma');
                if (url) editor.dispatchCommand(INSERT_FIGMA_COMMAND, url);
            },
        }),
    ];
}

export default function ComponentPickerPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
        minLength: 0,
    });

    const options = useMemo(() => {
        const baseOptions = getBaseOptions(editor);
        if (!queryString) return baseOptions;
        const regex = new RegExp(queryString, 'i');
        return baseOptions.filter(
            (option) =>
                regex.test(option.title) ||
                option.keywords.some((keyword) => regex.test(keyword)),
        );
    }, [editor, queryString]);

    const onSelectOption = useCallback(
        (
            selectedOption: ComponentPickerOption,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeToRemove: any | null,
            closeMenu: () => void,
            matchingString: string,
        ) => {
            editor.update(() => {
                nodeToRemove?.remove();
                selectedOption.onSelect(matchingString);
                closeMenu();
            });
        },
        [editor],
    );

    return (
        <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={options}
            menuRenderFn={(
                anchorElementRef,
                { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
            ) =>
                anchorElementRef.current && options.length
                    ? createPortal(
                          <div className="component-picker-menu z-50 max-h-[300px] min-w-[200px] overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg">
                              <ul>
                                  {options.map((option, i) => (
                                      <ComponentPickerMenuItem
                                          index={i}
                                          isSelected={selectedIndex === i}
                                          onClick={() => {
                                              setHighlightedIndex(i);
                                              selectOptionAndCleanUp(option);
                                          }}
                                          onMouseEnter={() =>
                                              setHighlightedIndex(i)
                                          }
                                          key={option.key}
                                          option={option}
                                      />
                                  ))}
                              </ul>
                          </div>,
                          anchorElementRef.current,
                      )
                    : null
            }
        />
    );
}
