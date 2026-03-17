import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { Klass, LexicalNode } from 'lexical';
import { ImageGalleryNode } from '../image-gallery-node';
import { ImageNode } from '../image-node';
import { YouTubeNode } from '../youtube-node';
import { LayoutContainerNode, LayoutItemNode } from './layout-nodes';
import { CollapsibleContainerNode, CollapsibleTitleNode, CollapsibleContentNode } from './collapsible-nodes';

export const nodes: Array<Klass<LexicalNode>> = [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    HorizontalRuleNode,
    ImageNode,
    YouTubeNode,
    ImageGalleryNode,
    MarkNode,
    OverflowNode,
    LayoutContainerNode,
    LayoutItemNode,
    CollapsibleContainerNode,
    CollapsibleTitleNode,
    CollapsibleContentNode,
];
