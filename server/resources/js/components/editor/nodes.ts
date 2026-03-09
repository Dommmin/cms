import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutocompleteNode } from './nodes/AutocompleteNode';
import { CollapsibleContainerNode } from './nodes/CollapsibleContainerNode';
import { CollapsibleContentNode } from './nodes/CollapsibleContentNode';
import { CollapsibleTitleNode } from './nodes/CollapsibleTitleNode';
import { DateNode } from './nodes/DateNode';
import { EmojiNode } from './nodes/EmojiNode';
import { FigmaNode } from './nodes/FigmaNode';
import { ImageNode } from './nodes/ImageNode';
import { KeywordNode } from './nodes/KeywordNode';
import { LayoutContainerNode } from './nodes/LayoutContainerNode';
import { LayoutItemNode } from './nodes/LayoutItemNode';
import { MentionNode } from './nodes/MentionNode';
import { PageBreakNode } from './nodes/PageBreakNode';
import { SpecialTextNode } from './nodes/SpecialTextNode';
import { TweetNode } from './nodes/TweetNode';
import { YouTubeNode } from './nodes/YouTubeNode';

export const nodes = [
    // Built-in Lexical nodes
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
    AutoLinkNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    HashtagNode,
    OverflowNode,
    MarkNode,
    HorizontalRuleNode,

    // Custom nodes
    DateNode,
    ImageNode,
    MentionNode,
    EmojiNode,
    AutocompleteNode,
    KeywordNode,
    TweetNode,
    YouTubeNode,
    FigmaNode,
    PageBreakNode,
    SpecialTextNode,
    LayoutContainerNode,
    LayoutItemNode,
    CollapsibleContainerNode,
    CollapsibleContentNode,
    CollapsibleTitleNode,
];
