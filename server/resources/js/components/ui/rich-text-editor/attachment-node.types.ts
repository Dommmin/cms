import type { LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type SerializedAttachmentNode = Spread<
    {
        mediaId: number | null;
        url: string;
        name: string;
        fileName: string;
        mimeType: string;
        size: number | null;
        description?: string | null;
    },
    SerializedLexicalNode
>;

export type CreateAttachmentNodePayload = {
    mediaId?: number | null;
    url: string;
    name: string;
    fileName?: string;
    mimeType?: string;
    size?: number | null;
    description?: string | null;
};

export type AttachmentNodeState = {
    mediaId: number | null;
    url: string;
    name: string;
    fileName: string;
    mimeType: string;
    size: number | null;
    description: string | null;
};

export type AttachmentComponentProps = AttachmentNodeState & {
    nodeKey: NodeKey;
    editor: LexicalEditor;
};
