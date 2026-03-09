import { AutoLinkPlugin as LexicalAutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { type JSX } from 'react';
import { MATCHERS } from '../utils/url';

export default function AutoLinkPlugin(): JSX.Element {
    return <LexicalAutoLinkPlugin matchers={MATCHERS} />;
}
