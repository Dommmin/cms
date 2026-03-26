/**
 * Section Templates Dialog
 * Pre-built section + block combos that can be inserted with a single click.
 */

import { LayoutTemplate } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Block } from '../types';
import type { SectionTemplate, SectionTemplatesDialogProps } from './section-templates-dialog.types';

// Pre-built templates — each defines the full section + block structure to insert.
export const SECTION_TEMPLATES: SectionTemplate[] = [
    {
        id: 'landing-hero',
        name: 'Landing Hero',
        description: 'Hero banner with a promotional banner below',
        tags: ['marketing', 'homepage'],
        sections: [
            {
                section_type: 'full_width',
                layout: 'full_width',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'hero_banner',
                        configuration: {
                            title: 'Welcome to our Store',
                            subtitle:
                                'Discover amazing products at great prices.',
                            cta_text: 'Shop Now',
                            cta_url: '/products',
                            cta_style: 'primary',
                            text_alignment: 'center',
                            overlay_opacity: 40,
                            min_height: 500,
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'promotional_banner',
                        configuration: {
                            title: 'Summer Sale – Up to 50% Off',
                            subtitle: 'Limited time offer on selected items.',
                            badge_text: 'Limited Time',
                            link_text: 'Shop the Sale',
                            link_url: '/products',
                            background_color: '#1e293b',
                            text_color: '#ffffff',
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
    {
        id: 'product-showcase',
        name: 'Product Showcase',
        description: 'Featured products grid with categories below',
        tags: ['ecommerce', 'products'],
        sections: [
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'featured_products',
                        configuration: {
                            title: 'Best Sellers',
                            display_mode: 'grid',
                            items_per_row: 4,
                            max_items: 8,
                            show_price: true,
                            show_add_to_cart: true,
                            show_badges: true,
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'categories_grid',
                        configuration: {
                            title: 'Shop by Category',
                            columns: 4,
                            show_labels: true,
                            style: 'square',
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
    {
        id: 'about-us',
        name: 'About Us',
        description: 'Two-column content section with testimonials',
        tags: ['content', 'about'],
        sections: [
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'two_columns',
                        configuration: {
                            left_content:
                                '<h2>Our Story</h2><p>We started with a simple idea...</p>',
                            right_content:
                                '<p>Our team is passionate about quality and service.</p>',
                            ratio: '50-50',
                            vertical_alignment: 'top',
                            reverse_on_mobile: false,
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'testimonials',
                        configuration: {
                            title: 'What Our Customers Say',
                            display_mode: 'grid',
                            show_rating: true,
                            items: [
                                {
                                    author: 'Jane Smith',
                                    role: 'Happy Customer',
                                    content: 'Absolutely love this store!',
                                    rating: 5,
                                },
                                {
                                    author: 'John Doe',
                                    role: 'Loyal Buyer',
                                    content: 'Fast shipping, great quality.',
                                    rating: 5,
                                },
                            ],
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
    {
        id: 'faq-page',
        name: 'FAQ Page',
        description: 'Intro text followed by an accordion FAQ',
        tags: ['content', 'support'],
        sections: [
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'rich_text',
                        configuration: {
                            content:
                                '<h1>Frequently Asked Questions</h1><p>Find answers to the most common questions below.</p>',
                            max_width: 'medium',
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                    {
                        type: 'accordion',
                        configuration: {
                            title: '',
                            allow_multiple_open: false,
                            items: [
                                {
                                    title: 'How do I place an order?',
                                    content:
                                        'Simply browse our store, add items to your cart and checkout.',
                                },
                                {
                                    title: 'What is your return policy?',
                                    content:
                                        'We accept returns within 30 days of purchase.',
                                },
                                {
                                    title: 'How long does shipping take?',
                                    content:
                                        'Standard shipping takes 3-5 business days.',
                                },
                            ],
                        },
                        position: 1,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
    {
        id: 'newsletter-cta',
        name: 'Newsletter CTA',
        description: 'Testimonials followed by newsletter signup',
        tags: ['marketing', 'conversion'],
        sections: [
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'testimonials',
                        configuration: {
                            title: 'Loved by Thousands',
                            display_mode: 'carousel',
                            show_rating: true,
                            items: [
                                {
                                    author: 'Alice',
                                    role: 'Customer',
                                    content: 'Best purchase ever!',
                                    rating: 5,
                                },
                            ],
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
            {
                section_type: 'full_width',
                layout: 'full_width',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'newsletter_signup',
                        configuration: {
                            title: 'Stay in the Loop',
                            description:
                                'Get exclusive offers and updates delivered to your inbox.',
                            button_text: 'Subscribe',
                            placeholder_text: 'Enter your email address',
                            success_message: 'Thanks for subscribing!',
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
    {
        id: 'media-gallery',
        name: 'Media Gallery',
        description: 'Image gallery with an optional video embed',
        tags: ['media', 'content'],
        sections: [
            {
                section_type: 'contained',
                layout: 'contained',
                variant: null,
                settings: null,
                is_active: true,
                blocks: [
                    {
                        type: 'image_gallery',
                        configuration: {
                            title: 'Our Gallery',
                            layout: 'grid',
                            columns: 3,
                            enable_lightbox: true,
                            show_captions: false,
                        },
                        position: 0,
                        is_active: true,
                        relations: [],
                    },
                    {
                        type: 'video_embed',
                        configuration: {
                            title: 'Watch Our Story',
                            video_url: '',
                            autoplay: false,
                            loop: false,
                            show_controls: true,
                            aspect_ratio: '16:9',
                        },
                        position: 1,
                        is_active: true,
                        relations: [],
                    },
                ] as Block[],
            },
        ],
    },
];

// ---------- Template thumbnail SVGs ----------

function LandingHeroThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="40" fill="#1e293b" />
            <rect
                x="30"
                y="10"
                width="60"
                height="6"
                rx="2"
                fill="white"
                fillOpacity="0.7"
            />
            <rect
                x="40"
                y="20"
                width="40"
                height="4"
                rx="1.5"
                fill="white"
                fillOpacity="0.4"
            />
            <rect x="45" y="28" width="30" height="8" rx="2" fill="#6366f1" />
            <rect width="120" height="32" y="40" fill="#f8fafc" />
            <rect x="10" y="48" width="100" height="16" rx="2" fill="#0f172a" />
            <rect
                x="16"
                y="52"
                width="50"
                height="4"
                rx="1"
                fill="white"
                fillOpacity="0.7"
            />
            <rect x="16" y="58" width="24" height="4" rx="1.5" fill="#6366f1" />
        </svg>
    );
}

function ProductShowcaseThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="72" fill="#f8fafc" />
            <rect x="6" y="6" width="24" height="24" rx="2" fill="#e2e8f0" />
            <rect x="34" y="6" width="24" height="24" rx="2" fill="#e2e8f0" />
            <rect x="62" y="6" width="24" height="24" rx="2" fill="#e2e8f0" />
            <rect x="90" y="6" width="24" height="24" rx="2" fill="#e2e8f0" />
            <rect x="6" y="42" width="24" height="24" rx="2" fill="#dbeafe" />
            <rect x="34" y="42" width="24" height="24" rx="2" fill="#dbeafe" />
            <rect x="62" y="42" width="24" height="24" rx="2" fill="#dbeafe" />
            <rect x="90" y="42" width="24" height="24" rx="2" fill="#dbeafe" />
        </svg>
    );
}

function AboutUsThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="72" fill="#f8fafc" />
            <rect
                x="6"
                y="6"
                width="52"
                height="32"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect
                x="62"
                y="6"
                width="52"
                height="32"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect x="10" y="12" width="30" height="4" rx="1.5" fill="#94a3b8" />
            <rect x="10" y="20" width="44" height="3" rx="1" fill="#e2e8f0" />
            <rect x="10" y="26" width="36" height="3" rx="1" fill="#e2e8f0" />
            <rect
                x="6"
                y="44"
                width="26"
                height="22"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect
                x="36"
                y="44"
                width="26"
                height="22"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect
                x="66"
                y="44"
                width="26"
                height="22"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect
                x="96"
                y="44"
                width="26"
                height="22"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
        </svg>
    );
}

function FaqPageThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="72" fill="#f8fafc" />
            <rect x="20" y="8" width="80" height="8" rx="2" fill="#94a3b8" />
            <rect x="20" y="20" width="60" height="4" rx="1" fill="#cbd5e1" />
            <rect
                x="6"
                y="30"
                width="108"
                height="10"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect x="10" y="34" width="50" height="3" rx="1" fill="#94a3b8" />
            <rect
                x="6"
                y="44"
                width="108"
                height="10"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect x="10" y="48" width="50" height="3" rx="1" fill="#94a3b8" />
            <rect
                x="6"
                y="58"
                width="108"
                height="10"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect x="10" y="62" width="50" height="3" rx="1" fill="#94a3b8" />
        </svg>
    );
}

function NewsletterCtaThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="72" fill="#f8fafc" />
            <rect
                x="6"
                y="6"
                width="52"
                height="28"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect
                x="62"
                y="6"
                width="52"
                height="28"
                rx="2"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1"
            />
            <rect x="0" y="38" width="120" height="34" fill="#1e293b" />
            <rect
                x="30"
                y="44"
                width="60"
                height="5"
                rx="1.5"
                fill="white"
                fillOpacity="0.8"
            />
            <rect
                x="30"
                y="53"
                width="40"
                height="4"
                rx="1"
                fill="white"
                fillOpacity="0.4"
            />
            <rect
                x="16"
                y="62"
                width="56"
                height="6"
                rx="1.5"
                fill="white"
                fillOpacity="0.15"
                stroke="white"
                strokeWidth="0.5"
            />
            <rect x="76" y="62" width="28" height="6" rx="1.5" fill="#6366f1" />
        </svg>
    );
}

function MediaGalleryThumb() {
    return (
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none">
            <rect width="120" height="72" fill="#f8fafc" />
            <rect x="4" y="4" width="34" height="28" rx="2" fill="#e2e8f0" />
            <rect x="42" y="4" width="34" height="28" rx="2" fill="#e2e8f0" />
            <rect x="80" y="4" width="36" height="28" rx="2" fill="#e2e8f0" />
            <rect x="4" y="36" width="112" height="30" rx="2" fill="#0f172a" />
            <circle cx="60" cy="51" r="10" fill="white" fillOpacity="0.15" />
            <polygon
                points="57,45 57,57 69,51"
                fill="white"
                fillOpacity="0.9"
            />
        </svg>
    );
}

const TEMPLATE_THUMBS: Record<string, React.FC> = {
    'landing-hero': LandingHeroThumb,
    'product-showcase': ProductShowcaseThumb,
    'about-us': AboutUsThumb,
    'faq-page': FaqPageThumb,
    'newsletter-cta': NewsletterCtaThumb,
    'media-gallery': MediaGalleryThumb,
};

// ---------- Dialog ----------

export function SectionTemplatesDialog({
    open,
    onClose,
    onInsert,
}: SectionTemplatesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col gap-0 p-0">
                <DialogHeader className="border-b px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5" />
                        Section Templates
                    </DialogTitle>
                    <DialogDescription>
                        Insert a pre-built section combo to get started quickly.
                        You can edit all content after inserting.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {SECTION_TEMPLATES.map((tpl) => {
                            const Thumb = TEMPLATE_THUMBS[tpl.id];
                            return (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => {
                                        onInsert(tpl);
                                        onClose();
                                    }}
                                    className="group flex flex-col rounded-xl border border-border bg-card text-left transition-all hover:border-primary hover:shadow-md"
                                >
                                    <div className="h-24 w-full overflow-hidden rounded-t-xl bg-muted">
                                        {Thumb ? (
                                            <Thumb />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                <LayoutTemplate className="h-8 w-8 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold">
                                            {tpl.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {tpl.description}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {tpl.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
