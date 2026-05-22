<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AuditBlogSeo extends Command
{
    protected $signature = 'blog:seo-audit
        {--fix : Fill missing generated SEO fields}
        {--force : Overwrite generated SEO fields even when they already have values}
        {--format=table : Output format: table or markdown}';

    protected $description = 'Audit blog posts for multilingual SEO metadata and optionally fill safe generated fields';

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $fix = (bool) $this->option('fix');

        $rows = BlogPost::query()
            ->with(['author:id,name', 'tags'])
            ->latest('published_at')
            ->get()
            ->map(fn (BlogPost $post): array => $this->auditPost($post, $fix, $force))
            ->all();

        if ($this->option('format') === 'markdown') {
            $this->line($this->markdown($rows));
        } else {
            $this->table(
                ['ID', 'Status', 'Title', 'Suggested SEO title', 'Suggested slug', 'Suggested description', 'Reason'],
                $rows,
            );
        }

        if ($fix) {
            $this->info('Generated missing blog SEO fields. Manual titles/descriptions were preserved unless --force was passed.');
        }

        return self::SUCCESS;
    }

    private function auditPost(BlogPost $post, bool $fix, bool $force): array
    {
        $locale = $this->primaryLocale($post);
        $title = $post->getTranslation('title', $locale, false) ?: $post->title;
        $content = $post->getTranslation('content', $locale, false) ?: $post->content;
        $excerpt = $post->getTranslation('excerpt', $locale, false) ?: $post->excerpt;
        $seoTitle = $this->seoTitle((string) $title);
        $metaDescription = $this->metaDescription((string) ($excerpt ?: $content));
        $slugTranslations = $this->slugTranslations($post);
        $suggestedSlug = $slugTranslations['en'] ?? $post->slug;

        $reasons = $this->reasons($post, $metaDescription, $slugTranslations);

        if ($fix) {
            $updates = [
                'reading_time' => $post->estimateReadingTime((string) $content),
                'slug_translations' => $slugTranslations,
                'translation_group_id' => $post->translation_group_id ?? (string) Str::uuid(),
            ];

            if ($force || blank($post->seo_title)) {
                $updates['seo_title'] = $seoTitle;
            }

            if ($force || blank($post->seo_description)) {
                $updates['seo_description'] = $metaDescription;
            }

            $post->update($updates);
        }

        return [
            $post->id,
            $post->status instanceof BlogPostStatusEnum ? $post->status->value : (string) $post->status,
            Str::limit(strip_tags((string) $title), 48),
            $seoTitle,
            $suggestedSlug,
            $metaDescription,
            implode('; ', $reasons),
        ];
    }

    private function primaryLocale(BlogPost $post): string
    {
        $locales = $post->availableLocaleCodes();

        if (in_array('en', $locales, true)) {
            return 'en';
        }

        return $locales[0] ?? config('app.locale', 'en');
    }

    private function seoTitle(string $title): string
    {
        $clean = mb_trim(preg_replace('/\s+/', ' ', strip_tags($title)) ?? $title);

        return Str::limit($clean, 58, '');
    }

    private function metaDescription(string $source): string
    {
        $clean = mb_trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($source))) ?? $source);

        return Str::limit($clean, 155, '');
    }

    /** @return array<string, string> */
    private function slugTranslations(BlogPost $post): array
    {
        $translations = $post->slug_translations ?? [];

        foreach ($post->availableLocaleCodes() as $locale) {
            if (($translations[$locale] ?? '') !== '') {
                continue;
            }

            $title = $post->getTranslation('title', $locale, false);

            if (is_string($title) && $title !== '') {
                $translations[$locale] = Str::slug($title);
            }
        }

        return array_filter($translations);
    }

    /** @param array<string, string> $slugTranslations */
    private function reasons(BlogPost $post, string $metaDescription, array $slugTranslations): array
    {
        $reasons = [];

        if (blank($post->seo_title)) {
            $reasons[] = 'missing seo_title';
        }

        if (blank($post->seo_description)) {
            $reasons[] = 'missing meta_description';
        }

        if ($post->reading_time === null) {
            $reasons[] = 'missing reading_time';
        }

        if ($post->translation_group_id === null && count($post->availableLocaleCodes()) > 1) {
            $reasons[] = 'missing translation_group_id';
        }

        if (($slugTranslations['en'] ?? '') === '' && in_array('en', $post->availableLocaleCodes(), true)) {
            $reasons[] = 'missing English slug';
        }

        if (mb_strlen($metaDescription) < 80) {
            $reasons[] = 'short meta_description';
        }

        if ($post->status !== BlogPostStatusEnum::Published) {
            $reasons[] = 'not published; should be noindex/excluded';
        }

        return $reasons === [] ? ['ok'] : $reasons;
    }

    /** @param array<int, array<int, mixed>> $rows */
    private function markdown(array $rows): string
    {
        $lines = [
            '| ID | Status | Current title | Suggested seo_title | Suggested slug | Suggested meta_description | Reason |',
            '|---:|---|---|---|---|---|---|',
        ];

        foreach ($rows as $row) {
            $lines[] = '| '.implode(' | ', array_map(fn (mixed $value): string => str_replace('|', '\\|', (string) $value), $row)).' |';
        }

        return implode(PHP_EOL, $lines);
    }
}
