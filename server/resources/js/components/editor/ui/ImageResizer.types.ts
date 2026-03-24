import type { LexicalEditor } from 'lexical';

export interface ImageResizerProps {
    editor: LexicalEditor;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    imageRef: React.RefObject<HTMLElement | null>;
    maxWidth?: number;
    onResizeStart: () => void;
    onResizeEnd: (
        width: 'inherit' | number,
        height: 'inherit' | number,
    ) => void;
    captionsEnabled: boolean;
}
