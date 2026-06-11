'use client';

import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import type { Faq } from '@/types/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    ChevronDown,
    CreditCard,
    HelpCircle,
    Info,
    RotateCcw,
    Search,
    ShoppingBag,
    Sparkles,
    Truck,
    User,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface FaqClientModuleProps {
    items: Faq[];
    pageTitle?: string;
    pageExcerpt?: string;
}

const dict = {
    pl: {
        title: 'Często Zadawane Pytania',
        description:
            'Znajdź szybkie odpowiedzi na pytania dotyczące zamówień, wysyłki, płatności i innych tematów.',
        searchPlaceholder: 'Wpisz swoje pytanie...',
        allCategories: 'Wszystkie tematy',
        orders: 'Zamówienia',
        shipping: 'Wysyłka i dostawa',
        returns: 'Zwroty i reklamacje',
        payments: 'Płatności',
        products: 'Produkty',
        account: 'Konto użytkownika',
        noResults: 'Brak wyników pasujących do Twoich kryteriów.',
        clearSearch: 'Wyczyść filtry',
        showingResults: 'Znaleziono {count} pytań',
        showingAll: 'Wszystkie pytania ({count})',
        needHelp: 'Nadal potrzebujesz pomocy?',
        contactSupport: 'Napisz do nas',
        contactSupportDesc:
            'Jeśli nie znalazłeś odpowiedzi na swoje pytanie, nasz zespół chętnie pomoże.',
    },
    en: {
        title: 'Frequently Asked Questions',
        description:
            'Find quick answers to your questions about orders, shipping, payments, and more.',
        searchPlaceholder: 'Type your question here...',
        allCategories: 'All Topics',
        orders: 'Orders',
        shipping: 'Shipping & Delivery',
        returns: 'Returns & Refunds',
        payments: 'Payments',
        products: 'Products',
        account: 'My Account',
        noResults: 'No questions found matching your search.',
        clearSearch: 'Clear search filters',
        showingResults: 'Showing {count} questions',
        showingAll: 'All questions ({count})',
        needHelp: 'Still need help?',
        contactSupport: 'Contact support',
        contactSupportDesc:
            "If you can't find what you are looking for, our team is here to help you.",
    },
} as const;

const categoryConfig: Record<
    string,
    {
        icon: React.ComponentType<{ className?: string }>;
        labelKey: keyof (typeof dict)['en'];
    }
> = {
    orders: { icon: ShoppingBag, labelKey: 'orders' },
    shipping: { icon: Truck, labelKey: 'shipping' },
    returns: { icon: RotateCcw, labelKey: 'returns' },
    payments: { icon: CreditCard, labelKey: 'payments' },
    products: { icon: Info, labelKey: 'products' },
    account: { icon: User, labelKey: 'account' },
};

export function FaqClientModule({
    items,
    pageTitle,
    pageExcerpt,
}: FaqClientModuleProps) {
    const { locale } = useTranslation();
    const activeLocale = (locale === 'pl' ? 'pl' : 'en') as 'pl' | 'en';
    const texts = dict[activeLocale];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [openItemId, setOpenItemId] = useState<number | null>(null);

    // Get unique categories from items
    const categories = useMemo(() => {
        const cats = new Set<string>();
        items.forEach((item) => {
            if (item.category && item.is_active) {
                cats.add(item.category);
            }
        });
        return Array.from(cats);
    }, [items]);

    // Filter items based on search query and active category
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (!item.is_active) return false;

            const matchesCategory =
                activeCategory === 'all' || item.category === activeCategory;

            const normalizedSearch = searchQuery.toLowerCase().trim();
            const matchesSearch =
                normalizedSearch === '' ||
                item.question.toLowerCase().includes(normalizedSearch) ||
                item.answer.toLowerCase().includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [items, searchQuery, activeCategory]);

    const handleToggle = (id: number) => {
        setOpenItemId((prev) => (prev === id ? null : id));
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveCategory('all');
        setOpenItemId(null);
    };

    // Helper to get category icon and label
    const getCategoryDetails = (cat: string) => {
        const config = categoryConfig[cat];
        if (config) {
            return {
                icon: config.icon,
                label: texts[config.labelKey] as string,
            };
        }

        // Capitalize default
        const fallbackLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
        return {
            icon: HelpCircle,
            label: fallbackLabel,
        };
    };

    return (
        <div className="from-background to-muted/20 relative overflow-hidden bg-linear-to-b py-12 md:py-20">
            {/* Background Glow Decorators */}
            <div className="bg-primary/5 absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full blur-3xl" />
            <div className="bg-primary/5 absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full blur-3xl" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="bg-primary/10 text-primary mb-4 inline-flex animate-pulse items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>FAQ</span>
                    </div>
                    <h1 className="text-foreground font-display mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        {pageTitle || texts.title}
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
                        {pageExcerpt || texts.description}
                    </p>
                </div>

                {/* Search Bar Container */}
                <div className="mx-auto mb-10 max-w-2xl">
                    <div className="group relative">
                        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={texts.searchPlaceholder}
                            className="bg-card h-14 w-full rounded-2xl pr-12 pl-11 text-base shadow-xs md:text-lg"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-4 transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories Tab Selector */}
                {categories.length > 0 && (
                    <div className="-mx-4 mb-10 scrollbar-thin overflow-x-auto px-4 pb-2">
                        <div className="flex min-w-max gap-2 md:justify-center">
                            <button
                                onClick={() => {
                                    setActiveCategory('all');
                                    setOpenItemId(null);
                                }}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all',
                                    activeCategory === 'all'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
                                )}
                            >
                                <HelpCircle className="h-4 w-4" />
                                <span>{texts.allCategories}</span>
                            </button>
                            {categories.map((cat) => {
                                const details = getCategoryDetails(cat);
                                const Icon = details.icon;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setActiveCategory(cat);
                                            setOpenItemId(null);
                                        }}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all',
                                            activeCategory === cat
                                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{details.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Count Header */}
                <div className="text-muted-foreground mb-6 flex items-center justify-between px-1 text-sm">
                    <span>
                        {searchQuery || activeCategory !== 'all'
                            ? texts.showingResults.replace(
                                  '{count}',
                                  filteredItems.length.toString(),
                              )
                            : texts.showingAll.replace(
                                  '{count}',
                                  filteredItems.length.toString(),
                              )}
                    </span>
                    {(searchQuery || activeCategory !== 'all') && (
                        <button
                            onClick={handleClearFilters}
                            className="text-primary cursor-pointer font-medium hover:underline"
                        >
                            {texts.clearSearch}
                        </button>
                    )}
                </div>

                {/* FAQ List */}
                <div className="min-h-[200px] w-full space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((faq) => {
                            const isOpen = openItemId === faq.id;
                            return (
                                <motion.div
                                    key={faq.id}
                                    layout="position"
                                    initial={false}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full"
                                >
                                    <div
                                        className={cn(
                                            'group bg-card w-full overflow-hidden rounded-2xl border transition-all duration-300',
                                            isOpen
                                                ? 'border-primary ring-primary/10 shadow-md ring-1'
                                                : 'border-border hover:border-primary/30 shadow-xs hover:shadow-sm',
                                        )}
                                    >
                                        <button
                                            onClick={() => handleToggle(faq.id)}
                                            className="hover:text-primary flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-bold transition-colors select-none md:text-lg"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="text-foreground">
                                                {faq.question}
                                            </span>
                                            <span
                                                className={cn(
                                                    'bg-muted group-hover:bg-primary/10 group-hover:text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                                                    isOpen &&
                                                        'bg-primary text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground rotate-180',
                                                )}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: 'auto',
                                                        opacity: 1,
                                                        transition: {
                                                            height: {
                                                                duration: 0.25,
                                                                ease: 'easeOut',
                                                            },
                                                            opacity: {
                                                                duration: 0.2,
                                                                delay: 0.05,
                                                            },
                                                        },
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                        transition: {
                                                            height: {
                                                                duration: 0.2,
                                                                ease: 'easeIn',
                                                            },
                                                            opacity: {
                                                                duration: 0.15,
                                                            },
                                                        },
                                                    }}
                                                    className="w-full overflow-hidden"
                                                >
                                                    <div className="border-border bg-muted/5 w-full border-t px-6 py-5">
                                                        <div
                                                            className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none leading-relaxed"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHtml(
                                                                    faq.answer,
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-border bg-card rounded-2xl border border-dashed px-4 py-12 text-center"
                        >
                            <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            <p className="text-foreground mb-2 text-lg font-semibold">
                                {texts.noResults}
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="text-primary cursor-pointer text-sm font-semibold hover:underline"
                            >
                                {texts.clearSearch}
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="border-border mt-16 border-t pt-10 text-center">
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                        {texts.needHelp}
                    </h3>
                    <p className="text-muted-foreground mx-auto mb-6 max-w-md">
                        {texts.contactSupportDesc}
                    </p>
                    <Link
                        href="/contact"
                        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-sm transition-all hover:opacity-95"
                    >
                        <span>{texts.contactSupport}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
