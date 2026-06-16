<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Models\Page;
use App\Models\User;
use App\Services\PageBuilderRulesService;
use App\Services\PageBuilderSyncService;
use App\Services\PageVersionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PageBuilderAiComposerService
{
    public function __construct(
        private readonly PageBuilderSnapshotValidator $snapshotValidator,
        private readonly PageBuilderSyncService $syncService,
        private readonly PageBuilderRulesService $rulesService,
        private readonly PageVersionService $versionService,
    ) {}

    /**
     * Persist an AI-generated builder snapshot using the same validators as human editors.
     *
     * @param  array<string, mixed>  $snapshot
     *
     * @throws ValidationException
     */
    public function compose(Page $page, array $snapshot, ?User $user = null): Page
    {
        $sanitized = $this->snapshotValidator->validateAndSanitize($snapshot, 'builder_snapshot', $user);

        return DB::transaction(function () use ($page, $sanitized, $user): Page {
            $page->forceFill(['builder_snapshot' => $sanitized])->save();
            $this->rulesService->enforce($page);
            $this->syncService->sync($page, $sanitized);
            $this->versionService->createVersion(
                $page->fresh() ?? $page,
                $user?->id,
                'AI-generated page composition',
                false,
                'ai',
            );

            return $page->fresh() ?? $page;
        });
    }
}
