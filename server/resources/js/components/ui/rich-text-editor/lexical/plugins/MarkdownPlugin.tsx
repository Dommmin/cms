import { CODE, HEADING, LINK, ORDERED_LIST, type Transformer, UNORDERED_LIST } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import type { JSX } from 'react';

const LIST: Transformer[] = [ORDERED_LIST, UNORDERED_LIST];
const HEADINGS: Transformer[] = [HEADING];

const TRANSFORMERS: Transformer[] = [...HEADINGS, ...LIST, CODE, LINK];

export default function MarkdownPlugin(): JSX.Element {
    return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
