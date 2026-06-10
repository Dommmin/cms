<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\StarterKitService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Applies a predefined starter kit, generating default pages and themes for a specific industry.')]
#[Signature('cms:apply-starter-kit {kit : The key of the starter kit (e.g. fashion, beauty, furniture)}')]
class ApplyStarterKitCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(StarterKitService $service): int
    {
        $kit = $this->argument('kit');

        if (! config('cms.starter_kits.'.$kit)) {
            $this->error(sprintf("Starter kit '%s' not found in configuration.", $kit));
            $this->line('Available kits: '.implode(', ', array_keys(config('cms.starter_kits', []))));

            return self::FAILURE;
        }

        $this->info(sprintf("Applying '%s' starter kit...", $kit));

        try {
            $result = $service->applyKit($kit);

            if ($result['theme']) {
                $this->info('✓ Theme applied: '.$result['theme']->name);
            }

            foreach ($result['pages'] as $page) {
                $this->info(sprintf('✓ Page created: %s (Slug: %s)', $page->title, $page->slug));
            }

            $this->info('Starter kit applied successfully.');

            return self::SUCCESS;
        } catch (Exception $exception) {
            $this->error('Failed to apply starter kit: '.$exception->getMessage());

            return self::FAILURE;
        }
    }
}
