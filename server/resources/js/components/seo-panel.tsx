import { AlertCircle, CheckCircle, Globe, Monitor, Smartphone, Facebook, Twitter } from 'lucide-react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeSeoHealth } from './seo-panel-health';
import type { CharCounterProps, SeoPanelProps } from './seo-panel.types';

function CharCounter({ value, max, warn }: CharCounterProps) {
    const isGood = value >= warn && value <= max;
    const isOver = value > max;
    return (
        <span
            className={`text-xs ${isOver ? 'text-destructive' : isGood ? 'text-green-600' : 'text-muted-foreground'}`}
        >
            [{value}/{max}]
            {isOver && <AlertCircle className="ml-1 inline h-3 w-3" />}
            {isGood && <CheckCircle className="ml-1 inline h-3 w-3" />}
        </span>
    );
}

const ROBOTS_OPTIONS = [
    {
        value: 'index, follow',
        label: 'Index & Follow (Recommended)',
        color: 'bg-green-500',
    },
    {
        value: 'noindex, follow',
        label: 'No Index, Follow',
        color: 'bg-amber-500',
    },
    {
        value: 'index, nofollow',
        label: 'Index, No Follow',
        color: 'bg-amber-500',
    },
    {
        value: 'noindex, nofollow',
        label: 'No Index, No Follow (Strongest block)',
        color: 'bg-destructive',
    },
];

export function SeoPanel({
    data,
    onChange,
    errors = {},
    showCanonical = false,
    urlPath = 'page-slug',
    titleFallback = 'Page Title',
    descriptionFallback = 'No description provided.',
    contentLength,
}: SeoPanelProps) {
    const robotsColor = useMemo(
        () =>
            ROBOTS_OPTIONS.find((o) => o.value === data.meta_robots)?.color ??
            'bg-green-500',
        [data.meta_robots],
    );

    const displayTitle = data.seo_title || titleFallback;
    const displayDescription = data.seo_description || descriptionFallback;
    const healthIssues = analyzeSeoHealth(data, {
        displayTitle,
        displayDescription,
        showCanonical,
        contentLength,
        urlPath,
    });

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium">Content quality</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Checks the SEO fields used before publishing.
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            healthIssues.some(
                                (issue) => issue.severity === 'error',
                            )
                                ? 'bg-destructive/10 text-destructive'
                                : healthIssues.length > 0
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                        }`}
                    >
                        {healthIssues.length === 0
                             ? 'Ready'
                             : `${healthIssues.length} issue${healthIssues.length === 1 ? '' : 's'}`}
                    </span>
                </div>

                {healthIssues.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                        {healthIssues.map((issue) => (
                            <li
                                key={issue.id}
                                className="flex items-start gap-2 text-sm"
                            >
                                <AlertCircle
                                    className={`mt-0.5 h-4 w-4 ${
                                        issue.severity === 'error'
                                            ? 'text-destructive'
                                            : 'text-amber-600'
                                    }`}
                                />
                                <span>{issue.message}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        No SEO publishing warnings.
                    </p>
                )}
            </div>

            {/* SEO Title */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <CharCounter
                        value={data.seo_title.length}
                        max={60}
                        warn={40}
                    />
                </div>
                <Input
                    id="seo_title"
                    value={data.seo_title}
                    onChange={(e) => onChange('seo_title', e.target.value)}
                    placeholder="Custom page title for search engines"
                />
                <InputError message={errors.seo_title} />
            </div>

            {/* Meta Description */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="seo_description">Meta Description</Label>
                    <CharCounter
                        value={data.seo_description.length}
                        max={160}
                        warn={120}
                    />
                </div>
                <Textarea
                    id="seo_description"
                    value={data.seo_description}
                    onChange={(e) =>
                        onChange('seo_description', e.target.value)
                    }
                    placeholder="Meta description for search engines (120-160 chars)"
                    rows={3}
                />
                <InputError message={errors.seo_description} />
            </div>

            {/* SERP Previews Tabbed Component */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Previews</Label>
                <Tabs defaultValue="desktop" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="desktop" className="flex items-center justify-center gap-1.5 py-1.5 text-xs">
                            <Monitor className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Google Desktop</span>
                            <span className="md:hidden">Desktop</span>
                        </TabsTrigger>
                        <TabsTrigger value="mobile" className="flex items-center justify-center gap-1.5 py-1.5 text-xs">
                            <Smartphone className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Google Mobile</span>
                            <span className="md:hidden">Mobile</span>
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="flex items-center justify-center gap-1.5 py-1.5 text-xs">
                            <Facebook className="h-3.5 w-3.5" />
                            <span>Facebook</span>
                        </TabsTrigger>
                        <TabsTrigger value="twitter" className="flex items-center justify-center gap-1.5 py-1.5 text-xs">
                            <Twitter className="h-3.5 w-3.5" />
                            <span>Twitter</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Google Desktop Preview */}
                    <TabsContent value="desktop" className="mt-3">
                        <div className="rounded-lg border bg-white dark:bg-zinc-950 p-5 shadow-sm font-sans text-left">
                            <div className="text-[12px] leading-5 text-[#202124] dark:text-[#bdc1c6] truncate flex items-center gap-1.5 font-normal">
                                <span className="truncate">https://example.com</span>
                                <span className="text-[#5f6368] dark:text-[#9aa0a6]">&rsaquo;</span>
                                <span className="truncate text-[#5f6368] dark:text-[#9aa0a6]">{urlPath.replace(/\//g, ' › ')}</span>
                            </div>
                            <h3 className="mt-1 text-[20px] leading-[26px] font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
                                {displayTitle}
                            </h3>
                            <p className="mt-1.5 text-[14px] leading-[22px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 break-words">
                                {displayDescription}
                            </p>
                        </div>
                    </TabsContent>

                    {/* Google Mobile Preview */}
                    <TabsContent value="mobile" className="mt-3">
                        <div className="rounded-lg border bg-white dark:bg-zinc-950 p-4 shadow-sm font-sans text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300">
                                    <Globe className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col text-[11px] leading-tight">
                                    <span className="font-medium text-[#202124] dark:text-[#e8eaed]">example.com</span>
                                    <span className="text-[#5f6368] dark:text-[#9aa0a6] truncate max-w-[200px]">
                                        https://example.com/{urlPath}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-[18px] leading-[22px] font-normal text-[#1558d6] dark:text-[#8ab4f8] hover:underline cursor-pointer">
                                {displayTitle}
                            </h3>
                            <p className="mt-1 text-[14px] leading-[20px] text-[#3c4043] dark:text-[#bdc1c6] line-clamp-3 break-words">
                                {displayDescription}
                            </p>
                        </div>
                    </TabsContent>

                    {/* Facebook Card Preview */}
                    <TabsContent value="facebook" className="mt-3">
                        <div className="rounded-lg border bg-white dark:bg-zinc-900 shadow-sm font-sans text-left overflow-hidden">
                            <div className="p-3 flex items-center gap-2 border-b dark:border-zinc-800">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                    CMS
</div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Your Store</p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                        Just now · <Globe className="h-3 w-3 inline" />
                                    </p>
                                </div>
                            </div>
                            <p className="p-3 text-[13px] text-zinc-800 dark:text-zinc-200">
                                Check out our latest update! 🚀
                            </p>
                            <div className="border-t dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition cursor-pointer">
                                <div className="aspect-[1.91/1] w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                                    {data.og_image ? (
                                        <img
                                            src={data.og_image}
                                            alt="Facebook OG Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                            <Globe className="h-10 w-10 text-zinc-400 mb-2" />
                                            <span className="text-xs text-zinc-500">No Open Graph Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-[#f0f2f5] dark:bg-[#242526] border-t dark:border-zinc-800">
                                    <p className="text-[11px] text-[#65676b] dark:text-[#b0b3b8] uppercase tracking-wide truncate">
                                        EXAMPLE.COM
                                    </p>
                                    <p className="text-[14px] font-semibold text-[#050505] dark:text-[#e4e6eb] truncate mt-0.5 leading-snug">
                                        {displayTitle}
                                    </p>
                                    <p className="text-[12px] text-[#65676b] dark:text-[#b0b3b8] line-clamp-2 mt-0.5 leading-normal">
                                        {displayDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Twitter Card Preview */}
                    <TabsContent value="twitter" className="mt-3">
                        <div className="rounded-lg border bg-white dark:bg-zinc-950 p-4 shadow-sm font-sans text-left">
                            <div className="flex gap-3 items-start mb-3">
                                <div className="h-9 w-9 rounded-full bg-zinc-850 dark:bg-zinc-800 flex items-center justify-center text-white font-bold text-xs border dark:border-zinc-700">
                                    X
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer">Your Store</span>
                                        <span className="text-zinc-500 dark:text-zinc-400 text-[14px]">@yourstore · 1m</span>
                                    </div>
                                    <p className="text-[14px] text-zinc-900 dark:text-zinc-100 mt-0.5 leading-snug">
                                        Check this out 👇
                                    </p>
                                </div>
                            </div>
                            <div className="ml-[48px] rounded-xl border dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition">
                                <div className="aspect-[1.91/1] w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                                    {data.og_image ? (
                                        <img
                                            src={data.og_image}
                                            alt="Twitter OG Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                            <Globe className="h-10 w-10 text-zinc-400 mb-2" />
                                            <span className="text-xs text-zinc-500">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t dark:border-zinc-800">
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate">
                                        example.com
                                    </p>
                                    <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                                        {displayTitle}
                                    </p>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                                        {displayDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Canonical URL */}
            {showCanonical && (
                <div className="grid gap-2">
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                        id="canonical_url"
                        value={data.canonical_url ?? ''}
                        onChange={(e) =>
                            onChange('canonical_url', e.target.value || null)
                        }
                        placeholder="https://example.com/canonical-url"
                    />
                    <InputError message={errors.canonical_url} />
                </div>
            )}

            {/* Robots */}
            <div className="grid gap-2">
                <Label>Meta Robots</Label>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${robotsColor}`} />
                    <Select
                        value={data.meta_robots}
                        onValueChange={(v) => onChange('meta_robots', v)}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ROBOTS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* OG Image */}
            <div className="grid gap-2">
                <Label htmlFor="og_image">OG Image URL</Label>
                <Input
                    id="og_image"
                    value={data.og_image ?? ''}
                    onChange={(e) =>
                        onChange('og_image', e.target.value || null)
                    }
                    placeholder="https://example.com/og-image.jpg"
                />
                {data.og_image && (
                    <img
                        src={data.og_image}
                        alt="OG preview"
                        className="h-16 w-24 rounded border object-cover"
                    />
                )}
                <InputError message={errors.og_image} />
            </div>

            {/* Sitemap Exclude */}
            <div className="flex items-start gap-3">
                <Checkbox
                    id="sitemap_exclude"
                    checked={data.sitemap_exclude}
                    onCheckedChange={(checked) =>
                        onChange('sitemap_exclude', checked === true)
                    }
                />
                <div>
                    <Label htmlFor="sitemap_exclude" className="cursor-pointer">
                        Exclude from XML sitemap
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Prevent this page from appearing in the sitemap.xml
                    </p>
                </div>
            </div>
        </div>
    );
}
