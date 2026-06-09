<?php

declare(strict_types=1);

namespace App\Traits;

use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Seo\SeoMetadataFilter;

trait HasSeoMetadata
{
    /**
     * Get filtered SEO metadata.
     *
     * @return array{title: ?string, description: ?string, og_image: ?string, robots: ?string, canonical: ?string}
     */
    public function getSeoMetadata(): array
    {
        $metadata = [
            'title' => $this->seo_title,
            'description' => $this->seo_description,
            'og_image' => $this->og_image ?? null,
            'robots' => $this->meta_robots ?? 'index, follow',
            'canonical' => $this->seo_canonical ?? $this->canonical_url ?? null,
        ];

        $filter = Hook::filter(new SeoMetadataFilter($metadata, $this));

        return $filter->metadata;
    }
}
