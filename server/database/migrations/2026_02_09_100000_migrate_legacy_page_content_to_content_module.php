<?php

declare(strict_types=1);

use App\Models\ContentEntry;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Migrate legacy pages with non-empty content to module "content":
     * create ContentEntry from page.content, set page_type=module, module_name=content, module_config.
     */
    public function up(): void
    {
        $pages = Page::query()
            ->whereNotNull('content')
            ->where('content', '!=', '')
            ->where(function ($q): void {
                $q->where('page_type', '!=', 'module')
                    ->orWhereNull('module_name')
                    ->orWhere('module_name', '!=', 'content');
            })
            ->get();

        /** @var Page $page */
        foreach ($pages as $page) {
            $entry = ContentEntry::query()->create([
                'name' => $page->title,
                'content' => $page->content,
                'is_active' => true,
            ]);

            $page->update([
                'page_type' => 'module',
                'module_name' => 'content',
                'module_config' => ['content_id' => $entry->id],
                'content' => null,
            ]);
        }
    }

    public function down(): void
    {
        // Cannot safely reverse: would need to restore content from ContentEntry.
        // No-op.
    }
};
