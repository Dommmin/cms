import type { LexicalEditor, NodeKey } from 'lexical';

export interface ImageComponentProps {
    altText: string;
    caption: LexicalEditor;
    captionsEnabled: boolean;
    height: 'inherit' | number;
    maxWidth: number;
    nodeKey: NodeKey;
    resizable: boolean;
    showCaption: boolean;
    src: string;
    width: 'inherit' | number;
}
