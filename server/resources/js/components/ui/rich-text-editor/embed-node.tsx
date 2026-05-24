import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import type { JSX } from 'react';
import type { EmbedDefinition, EmbedPlatform, SerializedEmbedNode } from './embed-node.types';

const PLATFORM_LABELS: Record<EmbedPlatform, string> = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    spotify: 'Spotify',
    loom: 'Loom',
    tiktok: 'TikTok',
};

function safeUrl(input: string): URL | null {
    try {
        const url = new URL(input);
        return url.protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}

function hostIncludes(url: URL, host: string): boolean {
    return url.hostname === host || url.hostname.endsWith(`.${host}`);
}

function extractYouTubeIdFromUrl(url: URL): string | null {
    if (hostIncludes(url, 'youtu.be')) {
        return url.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    if (!hostIncludes(url, 'youtube.com') && !hostIncludes(url, 'youtube-nocookie.com')) {
        return null;
    }

    if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/').filter(Boolean)[1] ?? null;
    }

    if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.split('/').filter(Boolean)[1] ?? null;
    }

    return url.searchParams.get('v');
}

function detectYouTube(url: URL, sourceUrl: string): EmbedDefinition | null {
    const id = extractYouTubeIdFromUrl(url);
    if (!id) return null;

    return {
        platform: 'youtube',
        sourceUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
        label: 'YouTube video',
    };
}

function detectVimeo(url: URL, sourceUrl: string): EmbedDefinition | null {
    if (!hostIncludes(url, 'vimeo.com') && !hostIncludes(url, 'player.vimeo.com')) {
        return null;
    }

    const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
    if (!id) return null;

    return {
        platform: 'vimeo',
        sourceUrl,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        label: 'Vimeo video',
    };
}

function detectSpotify(url: URL, sourceUrl: string): EmbedDefinition | null {
    if (!hostIncludes(url, 'spotify.com')) {
        return null;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts[0] === 'embed' ? 1 : 0;
    const type = parts[embedIndex];
    const id = parts[embedIndex + 1];
    const supportedTypes = new Set(['album', 'artist', 'episode', 'playlist', 'show', 'track']);

    if (!type || !id || !supportedTypes.has(type)) {
        return null;
    }

    return {
        platform: 'spotify',
        sourceUrl,
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        label: `Spotify ${type}`,
    };
}

function detectLoom(url: URL, sourceUrl: string): EmbedDefinition | null {
    if (!hostIncludes(url, 'loom.com')) {
        return null;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[0] === 'embed' || parts[0] === 'share' ? parts[1] : null;
    if (!id) return null;

    return {
        platform: 'loom',
        sourceUrl,
        embedUrl: `https://www.loom.com/embed/${id}`,
        label: 'Loom video',
    };
}

function detectTikTok(url: URL, sourceUrl: string): EmbedDefinition | null {
    if (!hostIncludes(url, 'tiktok.com')) {
        return null;
    }

    const match = url.pathname.match(/\/video\/(\d+)/);
    if (!match) return null;

    return {
        platform: 'tiktok',
        sourceUrl,
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
        label: 'TikTok video',
    };
}

export function detectEmbed(input: string): EmbedDefinition | null {
    const normalized = input.trim();
    const url = safeUrl(normalized);
    if (!url) return null;

    return detectYouTube(url, normalized)
        ?? detectVimeo(url, normalized)
        ?? detectSpotify(url, normalized)
        ?? detectLoom(url, normalized)
        ?? detectTikTok(url, normalized);
}

function EmbedComponent({ definition }: { definition: EmbedDefinition }): JSX.Element {
    return (
        <figure contentEditable={false} className="my-4" data-rte-embed data-embed-platform={definition.platform}>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <iframe
                    src={definition.embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    title={definition.label}
                />
            </div>
            <figcaption className="mt-1 text-xs text-muted-foreground">
                {PLATFORM_LABELS[definition.platform]}
            </figcaption>
        </figure>
    );
}

export class EmbedNode extends DecoratorNode<JSX.Element> {
    __definition: EmbedDefinition;

    static getType(): string {
        return 'embed';
    }

    static clone(node: EmbedNode): EmbedNode {
        return new EmbedNode(node.__definition, node.__key);
    }

    constructor(definition: EmbedDefinition, key?: NodeKey) {
        super(key);
        this.__definition = definition;
    }

    static importJSON(serialized: SerializedEmbedNode): EmbedNode {
        return $createEmbedNode({
            platform: serialized.platform,
            sourceUrl: serialized.sourceUrl,
            embedUrl: serialized.embedUrl,
            label: serialized.label,
        });
    }

    exportJSON(): SerializedEmbedNode {
        return {
            type: 'embed',
            version: 1,
            ...this.__definition,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            iframe: (domNode: HTMLElement) => {
                const src = domNode.getAttribute('src') ?? '';
                return detectEmbed(src) ? { conversion: convertIframe, priority: 1 } : null;
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const wrapper = document.createElement('figure');
        wrapper.setAttribute('data-rte-embed', 'true');
        wrapper.setAttribute('data-embed-platform', this.__definition.platform);
        wrapper.style.cssText = 'margin:1rem 0;';

        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', this.__definition.embedUrl);
        iframe.setAttribute('title', this.__definition.label);
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');

        const caption = document.createElement('figcaption');
        caption.textContent = PLATFORM_LABELS[this.__definition.platform];

        wrapper.append(iframe, caption);

        return { element: wrapper };
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
        return <EmbedComponent definition={this.__definition} />;
    }
}

function convertIframe(domNode: HTMLElement): DOMConversionOutput | null {
    const src = domNode.getAttribute('src') ?? '';
    const definition = detectEmbed(src);
    if (!definition) return null;

    return { node: $createEmbedNode(definition) };
}

export function $createEmbedNode(definition: EmbedDefinition): EmbedNode {
    return $applyNodeReplacement(new EmbedNode(definition));
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
    return node instanceof EmbedNode;
}
