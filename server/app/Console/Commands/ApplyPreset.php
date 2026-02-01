<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Modules\Core\Domain\Services\PresetService;
use Illuminate\Console\Command;

final class ApplyPreset extends Command
{
    protected $signature = 'preset:apply {preset : The preset to apply (landing, shop, blog, corporate)}';

    protected $description = 'Apply a preset configuration for quick client setup';

    public function handle(PresetService $presetService): int
    {
        $preset = $this->argument('preset');

        if (!in_array($preset, ['landing', 'shop', 'blog', 'corporate'], true)) {
            $this->error("Invalid preset: {$preset}. Available: landing, shop, blog, corporate");
            return 1;
        }

        $this->info("Applying preset: {$preset}...");

        try {
            $presetService->applyPreset($preset);
            $this->info("Preset '{$preset}' applied successfully!");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to apply preset: {$e->getMessage()}");
            return 1;
        }
    }
}

