/**
 * Block Thumbnail
 * Small SVG wireframe preview shown in the collapsed block card header.
 * Each block type gets a schematic that hints at its visual layout.
 */

type BlockThumbnailProps = {
    blockType: string;
    className?: string;
};

const W = 64;
const H = 36;

function ThumbnailSvg({ children }: { children: React.ReactNode }) {
    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="shrink-0 overflow-hidden rounded border border-border bg-muted/50"
            aria-hidden
        >
            {children}
        </svg>
    );
}

// Reusable primitives
const Line = ({
    y,
    x1 = 4,
    x2 = 60,
}: {
    y: number;
    x1?: number;
    x2?: number;
}) => (
    <rect
        x={x1}
        y={y}
        width={x2 - x1}
        height={1.5}
        rx={0.75}
        fill="currentColor"
        opacity={0.3}
    />
);
const Rect = ({
    x,
    y,
    w,
    h,
    opacity = 0.2,
}: {
    x: number;
    y: number;
    w: number;
    h: number;
    opacity?: number;
}) => (
    <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={1}
        fill="currentColor"
        opacity={opacity}
    />
);
const Circle = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
    <circle cx={cx} cy={cy} r={r} fill="currentColor" opacity={0.2} />
);

// --- Per-type wireframes ---

function HeroBannerThumb() {
    return (
        <ThumbnailSvg>
            <Rect x={0} y={0} w={W} h={H} opacity={0.12} />
            {/* Heading */}
            <Line y={8} x1={8} x2={56} />
            <Line y={12} x1={14} x2={50} />
            {/* Subtitle */}
            <Line y={18} x1={18} x2={46} />
            {/* CTA button */}
            <Rect x={22} y={23} w={20} h={7} opacity={0.35} />
        </ThumbnailSvg>
    );
}

function RichTextThumb() {
    return (
        <ThumbnailSvg>
            <Line y={5} x1={4} x2={60} />
            <Line y={9} x1={4} x2={55} />
            <Line y={13} x1={4} x2={58} />
            <Line y={17} x1={4} x2={42} />
            <Line y={24} x1={4} x2={50} />
            <Line y={28} x1={4} x2={56} />
        </ThumbnailSvg>
    );
}

function FeaturedProductsThumb() {
    return (
        <ThumbnailSvg>
            {/* Title */}
            <Line y={4} x1={18} x2={46} />
            {/* 3 product cards */}
            {[0, 1, 2].map((i) => (
                <g key={i}>
                    <Rect x={4 + i * 21} y={10} w={18} h={12} opacity={0.25} />
                    <Line y={25} x1={4 + i * 21} x2={22 + i * 21} />
                    <Line y={29} x1={8 + i * 21} x2={18 + i * 21} />
                </g>
            ))}
        </ThumbnailSvg>
    );
}

function CategoriesGridThumb() {
    return (
        <ThumbnailSvg>
            <Line y={4} x1={20} x2={44} />
            {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                    <Rect
                        x={4 + (i % 2) * 31}
                        y={10 + Math.floor(i / 2) * 13}
                        w={27}
                        h={10}
                        opacity={0.2}
                    />
                </g>
            ))}
        </ThumbnailSvg>
    );
}

function PromotionalBannerThumb() {
    return (
        <ThumbnailSvg>
            <Rect x={0} y={0} w={W} h={H} opacity={0.15} />
            {/* Badge */}
            <Rect x={4} y={6} w={14} h={5} opacity={0.4} />
            {/* Title */}
            <Line y={16} x1={4} x2={48} />
            <Line y={20} x1={4} x2={36} />
            {/* Link */}
            <Line y={27} x1={4} x2={22} />
        </ThumbnailSvg>
    );
}

function NewsletterSignupThumb() {
    return (
        <ThumbnailSvg>
            <Line y={6} x1={14} x2={50} />
            <Line y={11} x1={18} x2={46} />
            {/* Email input */}
            <Rect x={4} y={18} w={38} h={8} opacity={0.15} />
            {/* Submit button */}
            <Rect x={44} y={18} w={16} h={8} opacity={0.35} />
        </ThumbnailSvg>
    );
}

function TestimonialsThumb() {
    return (
        <ThumbnailSvg>
            {/* Quote mark */}
            <text x={4} y={12} fontSize={10} fill="currentColor" opacity={0.3}>
                &ldquo;
            </text>
            <Line y={13} x1={12} x2={58} />
            <Line y={18} x1={12} x2={52} />
            <Line y={23} x1={12} x2={40} />
            {/* Author avatar + name */}
            <Circle cx={12} cy={31} r={4} />
            <Line y={29} x1={19} x2={40} />
        </ThumbnailSvg>
    );
}

function ImageGalleryThumb() {
    return (
        <ThumbnailSvg>
            <Line y={4} x1={20} x2={44} />
            {/* 3 image slots */}
            <Rect x={4} y={9} w={17} h={22} opacity={0.2} />
            <Rect x={23} y={9} w={17} h={10} opacity={0.2} />
            <Rect x={23} y={21} w={17} h={10} opacity={0.2} />
            <Rect x={42} y={9} w={17} h={22} opacity={0.2} />
        </ThumbnailSvg>
    );
}

function VideoEmbedThumb() {
    return (
        <ThumbnailSvg>
            <Rect x={4} y={4} w={56} h={28} opacity={0.15} />
            {/* Play icon */}
            <circle cx={32} cy={18} r={8} fill="currentColor" opacity={0.2} />
            <polygon
                points="29,14 29,22 37,18"
                fill="currentColor"
                opacity={0.5}
            />
        </ThumbnailSvg>
    );
}

function TwoColumnsThumb() {
    return (
        <ThumbnailSvg>
            {/* Left column */}
            <Rect x={4} y={4} w={27} h={28} opacity={0.15} />
            <Line y={9} x1={6} x2={29} />
            <Line y={13} x1={6} x2={29} />
            <Line y={17} x1={6} x2={22} />
            {/* Right column */}
            <Rect x={33} y={4} w={27} h={28} opacity={0.15} />
            <Line y={9} x1={35} x2={58} />
            <Line y={13} x1={35} x2={58} />
            <Line y={17} x1={35} x2={51} />
        </ThumbnailSvg>
    );
}

function ThreeColumnsThumb() {
    return (
        <ThumbnailSvg>
            {[0, 1, 2].map((i) => (
                <g key={i}>
                    <Rect x={3 + i * 21} y={4} w={17} h={28} opacity={0.15} />
                    <Line y={10} x1={5 + i * 21} x2={18 + i * 21} />
                    <Line y={14} x1={5 + i * 21} x2={16 + i * 21} />
                    <Line y={18} x1={5 + i * 21} x2={18 + i * 21} />
                </g>
            ))}
        </ThumbnailSvg>
    );
}

function AccordionThumb() {
    return (
        <ThumbnailSvg>
            {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                    <Rect
                        x={4}
                        y={4 + i * 8}
                        w={56}
                        h={6}
                        opacity={i === 0 ? 0.25 : 0.12}
                    />
                    <Line y={7 + i * 8} x1={8} x2={48} />
                </g>
            ))}
        </ThumbnailSvg>
    );
}

function TabsThumb() {
    return (
        <ThumbnailSvg>
            {/* Tab headers */}
            {[0, 1, 2].map((i) => (
                <Rect
                    key={i}
                    x={4 + i * 21}
                    y={3}
                    w={18}
                    h={6}
                    opacity={i === 0 ? 0.4 : 0.15}
                />
            ))}
            {/* Tab content area */}
            <Rect x={4} y={11} w={56} h={22} opacity={0.1} />
            <Line y={17} x1={8} x2={56} />
            <Line y={21} x1={8} x2={50} />
            <Line y={25} x1={8} x2={44} />
        </ThumbnailSvg>
    );
}

function MapThumb() {
    return (
        <ThumbnailSvg>
            <Rect x={4} y={4} w={56} h={28} opacity={0.12} />
            {/* Map grid lines */}
            <Line y={14} x1={4} x2={60} />
            <rect
                x={28}
                y={4}
                width={1.5}
                height={28}
                fill="currentColor"
                opacity={0.15}
            />
            {/* Pin */}
            <circle cx={32} cy={14} r={4} fill="currentColor" opacity={0.35} />
            <line
                x1={32}
                y1={18}
                x2={32}
                y2={24}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.35}
            />
        </ThumbnailSvg>
    );
}

function FormEmbedThumb() {
    return (
        <ThumbnailSvg>
            <Line y={5} x1={4} x2={30} />
            <Rect x={4} y={9} w={56} h={6} opacity={0.15} />
            <Line y={19} x1={4} x2={30} />
            <Rect x={4} y={23} w={56} h={6} opacity={0.15} />
            <Rect x={20} y={32} w={24} h={0} opacity={0} />
        </ThumbnailSvg>
    );
}

function CustomHtmlThumb() {
    return (
        <ThumbnailSvg>
            <text
                x={4}
                y={16}
                fontSize={9}
                fill="currentColor"
                opacity={0.5}
                fontFamily="monospace"
            >
                {'<div>'}
            </text>
            <text
                x={10}
                y={23}
                fontSize={9}
                fill="currentColor"
                opacity={0.35}
                fontFamily="monospace"
            >
                {'...'}
            </text>
            <text
                x={4}
                y={30}
                fontSize={9}
                fill="currentColor"
                opacity={0.5}
                fontFamily="monospace"
            >
                {'</div>'}
            </text>
        </ThumbnailSvg>
    );
}

function GenericThumb({ icon }: { icon?: string }) {
    const label = icon
        ? icon
              .replace(/-/g, ' ')
              .split(' ')
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('')
              .slice(0, 2)
        : '?';
    return (
        <ThumbnailSvg>
            <Rect x={4} y={4} w={56} h={28} opacity={0.12} />
            <text
                x={W / 2}
                y={H / 2 + 4}
                fontSize={11}
                fill="currentColor"
                opacity={0.4}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight="bold"
            >
                {label}
            </text>
        </ThumbnailSvg>
    );
}

const THUMBNAILS: Record<string, (icon?: string) => React.ReactNode> = {
    hero_banner: () => <HeroBannerThumb />,
    rich_text: () => <RichTextThumb />,
    featured_products: () => <FeaturedProductsThumb />,
    categories_grid: () => <CategoriesGridThumb />,
    promotional_banner: () => <PromotionalBannerThumb />,
    newsletter_signup: () => <NewsletterSignupThumb />,
    testimonials: () => <TestimonialsThumb />,
    image_gallery: () => <ImageGalleryThumb />,
    video_embed: () => <VideoEmbedThumb />,
    two_columns: () => <TwoColumnsThumb />,
    three_columns: () => <ThreeColumnsThumb />,
    accordion: () => <AccordionThumb />,
    tabs: () => <TabsThumb />,
    map: () => <MapThumb />,
    form_embed: () => <FormEmbedThumb />,
    custom_html: () => <CustomHtmlThumb />,
};

export function BlockThumbnail({ blockType, className }: BlockThumbnailProps) {
    const renderer = THUMBNAILS[blockType];
    return (
        <div className={className}>
            {renderer ? renderer() : <GenericThumb />}
        </div>
    );
}
