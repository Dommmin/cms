<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use App\Models\PageVersion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PageVersionService
{
    /**
     * Create a new version snapshot of a page
     */
    public function createVersion(Page $page, ?int $userId = null, ?string $changeNote = null): PageVersion
    {
        $versionNumber = $this->getNextVersionNumber($page);

        /** @var Collection<int, \App\Modules\Core\Domain\Models\PageSection> $sections */
        $sections = $page->allSections()
            ->with('allBlocks')
            ->get();

        $sections = $sections->map(fn ($section): array => [
            'section' => $section->toArray(),
            'blocks' => $section->allBlocks()->get()->map(fn ($block) => $block->toArray())->toArray(),
        ])
            ->all();

        $snapshot = [
            'page' => $page->toArray(),
            'sections' => $sections,
            'legacy_blocks' => $page->allBlocks()->get()->map(fn ($block) => $block->toArray())->all(),
            'created_at' => now()->toIso8601String(),
        ];

        return PageVersion::query()->create([
            'page_id' => $page->id,
            'version_number' => $versionNumber,
            'snapshot' => $snapshot,
            'created_by' => $userId ?? Auth::id(),
            'change_note' => $changeNote,
        ]);
    }

    /**
     * Save current state as draft version
     */
    public function saveDraft(Page $page, ?int $userId = null, ?string $changeNote = null): PageVersion
    {
        $version = $this->createVersion($page, $userId, $changeNote);

        $page->update([
            'draft_version_id' => $version->id,
        ]);

        return $version;
    }

    /**
     * Publish a version (make it live)
     */
    public function publishVersion(Page $page, PageVersion $version): void
    {
        DB::transaction(function () use ($page, $version): void {
            // Restore page from snapshot
            $snapshot = $version->snapshot;
            $pageData = $snapshot['page'];

            // Update page with snapshot data
            $page->update([
                'title' => $pageData['title'],
                'slug' => $pageData['slug'],
                'content' => $pageData['content'] ?? null,
                'excerpt' => $pageData['excerpt'] ?? null,
                'layout' => $pageData['layout'],
                'page_type' => $pageData['page_type'],
                'module_name' => $pageData['module_name'] ?? null,
                'module_config' => $pageData['module_config'] ?? null,
                'is_published' => true,
                'published_at' => now(),
                'published_version_id' => $version->id,
            ]);

            // Restore blocks if page is blocks type
            if ($page->isBlocksType()) {
                // Delete existing sections and blocks
                $page->allBlocks()->delete();
                $page->allSections()->delete();

                // Restore from section snapshot if available
                if (isset($snapshot['sections']) && is_array($snapshot['sections']) && $snapshot['sections'] !== []) {
                    foreach ($snapshot['sections'] as $sectionData) {
                        /** @var \App\Modules\Core\Domain\Models\PageSection $section */
                        $section = $page->allSections()->create([
                            'section_type' => $sectionData['section']['section_type'] ?? null,
                            'layout' => $sectionData['section']['layout'] ?? 'default',
                            'variant' => $sectionData['section']['variant'] ?? null,
                            'settings' => $sectionData['section']['settings'] ?? null,
                            'position' => $sectionData['section']['position'] ?? 0,
                            'is_active' => $sectionData['section']['is_active'] ?? true,
                        ]);

                        foreach ($sectionData['blocks'] ?? [] as $blockData) {
                            $section->allBlocks()->create([
                                'page_id' => $page->id,
                                'type' => $blockData['type'],
                                'configuration' => $blockData['configuration'],
                                'position' => $blockData['position'],
                                'is_active' => $blockData['is_active'] ?? true,
                            ]);
                        }
                    }
                } elseif (isset($snapshot['legacy_blocks'])) {
                    // Fallback: create a single default section for legacy blocks
                    /** @var \App\Modules\Core\Domain\Models\PageSection $section */
                    $section = $page->allSections()->create([
                        'section_type' => null,
                        'layout' => 'default',
                        'position' => 0,
                        'is_active' => true,
                    ]);

                    foreach ($snapshot['legacy_blocks'] as $blockData) {
                        $section->allBlocks()->create([
                            'page_id' => $page->id,
                            'type' => $blockData['type'],
                            'configuration' => $blockData['configuration'],
                            'position' => $blockData['position'],
                            'is_active' => $blockData['is_active'] ?? true,
                        ]);
                    }
                }
            }

            // Clear draft version
            $page->update(['draft_version_id' => null]);
        });
    }

    /**
     * Restore page to a specific version
     */
    public function restoreVersion(Page $page, PageVersion $version): void
    {
        $this->publishVersion($page, $version);
    }

    /**
     * Get all versions for a page
     *
     * @return Collection<int, PageVersion>
     */
    public function getVersions(Page $page)
    {
        return PageVersion::query()->where('page_id', $page->id)
            ->orderByDesc('version_number')
            ->with('creator')
            ->get();
    }

    /**
     * Get next version number for a page
     */
    private function getNextVersionNumber(Page $page): int
    {
        $latestVersion = PageVersion::query()->where('page_id', $page->id)
            ->orderByDesc('version_number')
            ->first();

        return $latestVersion ? $latestVersion->version_number + 1 : 1;
    }
}
