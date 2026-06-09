<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\StarterKitService;
use Illuminate\Console\Command;

class ApplyStarterKitCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cms:apply-starter-kit {kit : The key of the starter kit (e.g. fashion, beauty, furniture)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Applies a predefined starter kit, generating default pages and themes for a specific industry.';

    /**
     * Execute the console command.
     */
    public function handle(StarterKitService $service): int
    {
        $kit = $this->argument('kit');

        if (! config('cms.starter_kits.'.$kit)) {
            $this->error("Starter kit '{$kit}' not found in configuration.");
            $this->line("Available kits: " . implode(', ', array_keys(config('cms.starter_kits', []))));
            return self::FAILURE;
        }

        $this->info("Applying '{$kit}' starter kit...");

        try {
            $result = $service->applyKit($kit);
            
            if ($result['theme']) {
                $this->info("✓ Theme applied: " . $result['theme']->name);
            }
            
            foreach ($result['pages'] as $page) {
                $this->info("✓ Page created: {$page->title} (Slug: {$page->slug})");
            }

            $this->info('Starter kit applied successfully.');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to apply starter kit: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
