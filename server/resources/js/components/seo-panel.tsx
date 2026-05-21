import { AlertCircle, CheckCircle } from 'lucide-react';
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

            {/* SERP Preview */}
            <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Search Preview
                </p>
                <p className="text-xs text-muted-foreground">
                    example.com › {urlPath}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-blue-600 dark:text-blue-400">
                    {displayTitle}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {displayDescription}
                </p>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <div className="flex aspect-[1.91/1] items-center justify-center bg-muted">
                    {data.og_image ? (
                        <img
                            src={data.og_image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            No Open Graph image
                        </span>
                    )}
                </div>
                <div className="space-y-1 p-4">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Open Graph Preview
                    </p>
                    <p className="line-clamp-1 text-sm font-medium">
                        {displayTitle}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {displayDescription}
                    </p>
                </div>
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
