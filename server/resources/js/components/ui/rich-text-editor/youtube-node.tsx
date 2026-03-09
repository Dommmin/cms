import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import type { JSX } from 'react';

export type SerializedYouTubeNode = Spread<
    { videoId: string },
    SerializedLexicalNode
>;

function YouTubeComponent({ videoId }: { videoId: string }) {
    return (
        <div contentEditable={false} className="my-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    title="YouTube video"
                />
            </div>
        </div>
    );
}

export class YouTubeNode extends DecoratorNode<JSX.Element> {
    __videoId: string;

    static getType(): string {
        return 'youtube';
    }

    static clone(node: YouTubeNode): YouTubeNode {
        return new YouTubeNode(node.__videoId, node.__key);
    }

    constructor(videoId: string, key?: NodeKey) {
        super(key);
        this.__videoId = videoId;
    }

    static importJSON(serialized: SerializedYouTubeNode): YouTubeNode {
        return $createYouTubeNode(serialized.videoId);
    }

    exportJSON(): SerializedYouTubeNode {
        return { type: 'youtube', version: 1, videoId: this.__videoId };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            iframe: (domNode: HTMLElement) => {
                const src = domNode.getAttribute('src') ?? '';
                if (!src.includes('youtube') && !src.includes('youtu.be')) return null;
                return { conversion: convertYouTubeIframe, priority: 1 };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${this.__videoId}`);
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('class', 'w-full aspect-video rounded-lg');
        return { element: iframe };
    }

    createDOM(): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    isInline(): false {
        return false;
    }

    decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return <YouTubeComponent videoId={this.__videoId} />;
    }
}

function convertYouTubeIframe(domNode: HTMLElement): DOMConversionOutput | null {
    const src = domNode.getAttribute('src') ?? '';
    const videoId = extractYouTubeId(src);
    if (!videoId) return null;
    return { node: $createYouTubeNode(videoId) };
}

export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /youtube\.com\/embed\/([^?&\n]+)/,
        /youtube\.com\/watch\?v=([^&\n]+)/,
        /youtu\.be\/([^?&\n]+)/,
        /youtube\.com\/shorts\/([^?&\n]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export function $createYouTubeNode(videoId: string): YouTubeNode {
    return $applyNodeReplacement(new YouTubeNode(videoId));
}

export function $isYouTubeNode(node: LexicalNode | null | undefined): node is YouTubeNode {
    return node instanceof YouTubeNode;
}
