import type {
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { type JSX } from 'react';

export type SerializedYouTubeNode = Spread<{ videoID: string }, SerializedLexicalNode>;

export class YouTubeNode extends DecoratorNode<JSX.Element> {
    __id: string;

    static getType(): string {
        return 'youtube';
    }

    static clone(node: YouTubeNode): YouTubeNode {
        return new YouTubeNode(node.__id, node.__key);
    }

    constructor(id: string, key?: NodeKey) {
        super(key);
        this.__id = id;
    }

    static importJSON(node: SerializedYouTubeNode): YouTubeNode {
        return $createYouTubeNode(node.videoID);
    }

    exportJSON(): SerializedYouTubeNode {
        return { type: 'youtube', version: 1, videoID: this.__id };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-youtube-embed';
        return div;
    }

    updateDOM(): false {
        return false;
    }

    decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
        const embedBlock = config.theme.embedBlock as { base?: string } | undefined;
        const className = embedBlock?.base ?? '';
        return (
            <div className={className}>
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube-nocookie.com/embed/${this.__id}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full rounded-lg"
                    title="YouTube video"
                />
            </div>
        );
    }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
    return $applyNodeReplacement(new YouTubeNode(videoID));
}

export function $isYouTubeNode(node: unknown): node is YouTubeNode {
    return node instanceof YouTubeNode;
}
