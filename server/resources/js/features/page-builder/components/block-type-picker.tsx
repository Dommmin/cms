/**
 * Block Type Picker
 * Modal dialog showing all available block types with SVG thumbnails, grouped by category.
 */

import { SearchIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { BlockTypeConfig } from '../types';

// ---------- SVG Thumbnails ----------

function HeroBannerThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#e2e8f0" />
            <rect x="8" y="10" width="64" height="6" rx="2" fill="#94a3b8" />
            <rect x="20" y="20" width="40" height="4" rx="1.5" fill="#cbd5e1" />
            <rect x="28" y="30" width="24" height="8" rx="3" fill="#6366f1" />
        </svg>
    );
}

function RichTextThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="8" y="8" width="48" height="4" rx="1.5" fill="#64748b" />
            <rect x="8" y="16" width="64" height="3" rx="1" fill="#cbd5e1" />
            <rect x="8" y="22" width="60" height="3" rx="1" fill="#cbd5e1" />
            <rect x="8" y="28" width="56" height="3" rx="1" fill="#cbd5e1" />
            <rect x="8" y="34" width="44" height="3" rx="1" fill="#cbd5e1" />
        </svg>
    );
}

function FeaturedProductsThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="6" y="6" width="20" height="20" rx="2" fill="#e2e8f0" />
            <rect x="30" y="6" width="20" height="20" rx="2" fill="#e2e8f0" />
            <rect x="54" y="6" width="20" height="20" rx="2" fill="#e2e8f0" />
            <rect x="6" y="30" width="14" height="3" rx="1" fill="#cbd5e1" />
            <rect x="30" y="30" width="14" height="3" rx="1" fill="#cbd5e1" />
            <rect x="54" y="30" width="14" height="3" rx="1" fill="#cbd5e1" />
            <rect x="6" y="36" width="10" height="3" rx="1" fill="#6366f1" />
            <rect x="30" y="36" width="10" height="3" rx="1" fill="#6366f1" />
            <rect x="54" y="36" width="10" height="3" rx="1" fill="#6366f1" />
        </svg>
    );
}

function CategoriesGridThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="4" y="4" width="34" height="18" rx="2" fill="#e2e8f0" />
            <rect x="42" y="4" width="34" height="18" rx="2" fill="#e2e8f0" />
            <rect x="4" y="26" width="34" height="18" rx="2" fill="#e2e8f0" />
            <rect x="42" y="26" width="34" height="18" rx="2" fill="#e2e8f0" />
            <rect x="8" y="16" width="20" height="3" rx="1" fill="#94a3b8" />
            <rect x="46" y="16" width="20" height="3" rx="1" fill="#94a3b8" />
            <rect x="8" y="38" width="20" height="3" rx="1" fill="#94a3b8" />
            <rect x="46" y="38" width="20" height="3" rx="1" fill="#94a3b8" />
        </svg>
    );
}

function PromotionalBannerThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#1e293b" />
            <rect x="10" y="12" width="40" height="5" rx="1.5" fill="#f8fafc" opacity="0.9" />
            <rect x="10" y="21" width="28" height="4" rx="1" fill="#f8fafc" opacity="0.5" />
            <rect x="10" y="31" width="18" height="7" rx="2" fill="#6366f1" />
        </svg>
    );
}

function NewsletterThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="16" y="10" width="48" height="4" rx="1.5" fill="#64748b" />
            <rect x="16" y="18" width="48" height="3" rx="1" fill="#cbd5e1" />
            <rect x="8" y="28" width="42" height="10" rx="2" fill="white" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="52" y="28" width="20" height="10" rx="2" fill="#6366f1" />
        </svg>
    );
}

function TestimonialsThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="4" y="8" width="34" height="32" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="42" y="8" width="34" height="32" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="14" cy="20" r="6" fill="#e2e8f0" />
            <rect x="22" y="17" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="22" y="23" width="8" height="2" rx="1" fill="#cbd5e1" />
            <rect x="8" y="30" width="26" height="2" rx="1" fill="#e2e8f0" />
            <circle cx="52" cy="20" r="6" fill="#e2e8f0" />
            <rect x="60" y="17" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="60" y="23" width="8" height="2" rx="1" fill="#cbd5e1" />
            <rect x="46" y="30" width="26" height="2" rx="1" fill="#e2e8f0" />
        </svg>
    );
}

function ImageGalleryThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="4" y="4" width="22" height="18" rx="2" fill="#e2e8f0" />
            <rect x="29" y="4" width="22" height="18" rx="2" fill="#e2e8f0" />
            <rect x="54" y="4" width="22" height="18" rx="2" fill="#e2e8f0" />
            <rect x="4" y="26" width="22" height="18" rx="2" fill="#e2e8f0" />
            <rect x="29" y="26" width="22" height="18" rx="2" fill="#e2e8f0" />
            <rect x="54" y="26" width="22" height="18" rx="2" fill="#e2e8f0" />
        </svg>
    );
}

function VideoEmbedThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#0f172a" />
            <circle cx="40" cy="24" r="12" fill="white" fillOpacity="0.15" />
            <polygon points="36,18 36,30 50,24" fill="white" fillOpacity="0.9" />
        </svg>
    );
}

function CustomHtmlThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#0f172a" />
            <text x="8" y="22" fontSize="9" fill="#22d3ee" fontFamily="monospace">{'<div>'}</text>
            <text x="16" y="32" fontSize="9" fill="#94a3b8" fontFamily="monospace">{'...'}</text>
            <text x="8" y="42" fontSize="9" fill="#22d3ee" fontFamily="monospace">{'</div>'}</text>
        </svg>
    );
}

function TwoColumnsThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="4" y="4" width="34" height="40" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="42" y="4" width="34" height="40" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="8" width="26" height="4" rx="1.5" fill="#cbd5e1" />
            <rect x="8" y="16" width="26" height="3" rx="1" fill="#e2e8f0" />
            <rect x="8" y="22" width="22" height="3" rx="1" fill="#e2e8f0" />
            <rect x="46" y="8" width="26" height="4" rx="1.5" fill="#cbd5e1" />
            <rect x="46" y="16" width="26" height="3" rx="1" fill="#e2e8f0" />
            <rect x="46" y="22" width="22" height="3" rx="1" fill="#e2e8f0" />
        </svg>
    );
}

function ThreeColumnsThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="2" y="4" width="22" height="40" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="29" y="4" width="22" height="40" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="56" y="4" width="22" height="40" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="8" width="16" height="3" rx="1" fill="#cbd5e1" />
            <rect x="32" y="8" width="16" height="3" rx="1" fill="#cbd5e1" />
            <rect x="59" y="8" width="16" height="3" rx="1" fill="#cbd5e1" />
        </svg>
    );
}

function AccordionThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="6" y="6" width="68" height="10" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="10" width="30" height="3" rx="1" fill="#94a3b8" />
            <rect x="66" y="9" width="6" height="5" rx="1" fill="#cbd5e1" />
            <rect x="6" y="20" width="68" height="10" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="24" width="30" height="3" rx="1" fill="#94a3b8" />
            <rect x="66" y="23" width="6" height="5" rx="1" fill="#cbd5e1" />
            <rect x="6" y="34" width="68" height="10" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="38" width="30" height="3" rx="1" fill="#94a3b8" />
            <rect x="66" y="37" width="6" height="5" rx="1" fill="#cbd5e1" />
        </svg>
    );
}

function TabsThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="4" y="6" width="20" height="8" rx="2" fill="#6366f1" />
            <rect x="26" y="6" width="20" height="8" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="48" y="6" width="20" height="8" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="18" width="72" height="26" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="22" width="40" height="3" rx="1" fill="#cbd5e1" />
            <rect x="8" y="28" width="56" height="3" rx="1" fill="#e2e8f0" />
            <rect x="8" y="34" width="48" height="3" rx="1" fill="#e2e8f0" />
        </svg>
    );
}

function MapThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#dbeafe" />
            <rect x="4" y="4" width="72" height="40" rx="2" fill="#bfdbfe" />
            <line x1="0" y1="20" x2="80" y2="28" stroke="#93c5fd" strokeWidth="1.5" />
            <line x1="20" y1="0" x2="28" y2="48" stroke="#93c5fd" strokeWidth="1.5" />
            <circle cx="40" cy="22" r="6" fill="#3b82f6" />
            <circle cx="40" cy="22" r="3" fill="white" />
        </svg>
    );
}

function FormEmbedThumb() {
    return (
        <svg viewBox="0 0 80 48" className="h-full w-full" fill="none">
            <rect width="80" height="48" rx="3" fill="#f8fafc" />
            <rect x="8" y="8" width="64" height="8" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="20" width="64" height="8" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="32" width="32" height="8" rx="2" fill="#6366f1" />
        </svg>
    );
}

const BLOCK_THUMBNAILS: Record<string, React.FC> = {
    hero_banner: HeroBannerThumb,
    rich_text: RichTextThumb,
    featured_products: FeaturedProductsThumb,
    categories_grid: CategoriesGridThumb,
    promotional_banner: PromotionalBannerThumb,
    newsletter_signup: NewsletterThumb,
    testimonials: TestimonialsThumb,
    image_gallery: ImageGalleryThumb,
    video_embed: VideoEmbedThumb,
    custom_html: CustomHtmlThumb,
    two_columns: TwoColumnsThumb,
    three_columns: ThreeColumnsThumb,
    accordion: AccordionThumb,
    tabs: TabsThumb,
    map: MapThumb,
    form_embed: FormEmbedThumb,
};

const CATEGORY_ORDER = ['layout', 'content', 'ecommerce', 'marketing', 'social-proof', 'media', 'conversion', 'advanced'];
const CATEGORY_LABELS: Record<string, string> = {
    layout: 'Layout',
    content: 'Content',
    ecommerce: 'Ecommerce',
    marketing: 'Marketing',
    'social-proof': 'Social Proof',
    media: 'Media',
    conversion: 'Conversion',
    advanced: 'Advanced',
};

// ---------- Picker ----------

type BlockTypePickerProps = {
    open: boolean;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onSelect: (type: string) => void;
    onClose: () => void;
};

export function BlockTypePicker({ open, availableBlockTypes, onSelect, onClose }: BlockTypePickerProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const grouped = useMemo(() => {
        const q = query.toLowerCase();
        const entries = Object.entries(availableBlockTypes).filter(([type, cfg]) =>
            q === '' || cfg.name.toLowerCase().includes(q) || type.includes(q) || (cfg.description ?? '').toLowerCase().includes(q),
        );

        const byCategory: Record<string, Array<[string, BlockTypeConfig]>> = {};
        for (const entry of entries) {
            const cat = entry[1].category ?? 'other';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(entry);
        }

        return CATEGORY_ORDER.filter((c) => byCategory[c]).map((c) => ({
            category: c,
            label: CATEGORY_LABELS[c] ?? c,
            items: byCategory[c],
        }));
    }, [availableBlockTypes, query]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 p-0">
                <DialogHeader className="border-b px-6 pt-6 pb-4">
                    <DialogTitle>Add Block</DialogTitle>
                    <DialogDescription>
                        Choose a block type to add to this section.
                    </DialogDescription>
                    <div className="relative mt-3">
                        <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search blocks..."
                            className="pl-9"
                            autoFocus
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {grouped.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">No blocks match your search.</p>
                    )}
                    {grouped.map(({ category, label, items }) => (
                        <div key={category} className="mb-6 last:mb-0">
                            <h4 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {label}
                            </h4>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {items.map(([type, cfg]) => {
                                    const Thumb = BLOCK_THUMBNAILS[type];
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                onSelect(type);
                                                onClose();
                                            }}
                                            className="group flex flex-col rounded-lg border border-border bg-card p-2 text-left transition-colors hover:border-primary hover:bg-accent"
                                        >
                                            <div className="mb-2 h-12 w-full overflow-hidden rounded-md bg-muted">
                                                {Thumb ? (
                                                    <Thumb />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
                                                        ☐
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium leading-tight">{cfg.name}</span>
                                            {cfg.description && (
                                                <span className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                                                    {cfg.description}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
