<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use App\Models\PolicyDocumentVersion;
use Illuminate\Support\Facades\DB;

class LegalDocumentVersionService
{
    /**
     * @var array<int, string>
     */
    private const array VERSIONED_KEYS = [
        'privacy_policy',
        'cookie_policy',
        'terms_of_service',
        'shipping_policy',
        'return_policy',
        'legal_notice',
    ];

    public function syncPublishedPage(Page $page): ?PolicyDocumentVersion
    {
        if (! $this->shouldVersionPage($page)) {
            return null;
        }

        $locale = $page->locale;
        $checksum = $this->contentChecksum($page);

        return DB::transaction(function () use ($page, $locale, $checksum): PolicyDocumentVersion {
            $current = PolicyDocumentVersion::query()
                ->current()
                ->where('system_page_key', $page->system_page_key)
                ->where('locale', $locale)
                ->first();

            if ($current instanceof PolicyDocumentVersion
                && $current->page_id === $page->id
                && $current->content_checksum === $checksum) {
                return $current;
            }

            PolicyDocumentVersion::query()
                ->where('system_page_key', $page->system_page_key)
                ->where('locale', $locale)
                ->update(['is_current' => false]);

            $nextRevision = (int) PolicyDocumentVersion::query()
                ->where('system_page_key', $page->system_page_key)
                ->where('locale', $locale)
                ->max('revision') + 1;

            return PolicyDocumentVersion::query()->create([
                'system_page_key' => $page->system_page_key,
                'page_id' => $page->id,
                'locale' => $locale,
                'revision' => $nextRevision,
                'version_label' => sprintf('%s-v%d', $page->system_page_key, $nextRevision),
                'content_checksum' => $checksum,
                'effective_from' => $page->published_at ?? now(),
                'published_at' => $page->published_at ?? now(),
                'is_current' => true,
            ]);
        });
    }

    public function currentVersionFor(string $systemPageKey, ?string $locale = null): ?PolicyDocumentVersion
    {
        $resolvedLocale = $locale ?? app()->getLocale();

        $localized = PolicyDocumentVersion::query()
            ->current()
            ->where('system_page_key', $systemPageKey)
            ->where('locale', $resolvedLocale)
            ->latest('revision')
            ->first();

        if ($localized instanceof PolicyDocumentVersion) {
            return $localized;
        }

        return PolicyDocumentVersion::query()
            ->current()
            ->where('system_page_key', $systemPageKey)
            ->whereNull('locale')
            ->latest('revision')
            ->first();
    }

    /**
     * @return array<string, string|null>
     */
    public function consentVersionSnapshot(?string $locale = null): array
    {
        return [
            'privacy_policy' => $this->currentVersionFor('privacy_policy', $locale)?->version_label,
            'cookie_policy' => $this->currentVersionFor('cookie_policy', $locale)?->version_label,
        ];
    }

    public function consentVersionToken(?string $locale = null): string
    {
        $snapshot = $this->consentVersionSnapshot($locale);

        return mb_substr(
            hash('sha256', json_encode($snapshot, JSON_THROW_ON_ERROR)),
            0,
            16,
        );
    }

    /**
     * @return array<string, string|null>
     */
    public function checkoutLegalSnapshot(?string $locale = null): array
    {
        return [
            'terms_of_service' => $this->currentVersionFor('terms_of_service', $locale)?->version_label,
            'privacy_policy' => $this->currentVersionFor('privacy_policy', $locale)?->version_label,
        ];
    }

    public function shouldVersionPage(Page $page): bool
    {
        return $page->is_published
            && is_string($page->system_page_key)
            && in_array($page->system_page_key, self::VERSIONED_KEYS, true);
    }

    private function contentChecksum(Page $page): string
    {
        return hash('sha256', json_encode([
            'title' => $page->title,
            'content' => $page->content,
            'excerpt' => $page->excerpt,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
        ], JSON_THROW_ON_ERROR));
    }
}
