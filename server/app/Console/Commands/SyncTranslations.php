<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Locale;
use App\Models\Translation;
use FilesystemIterator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class SyncTranslations extends Command
{
    protected $signature = 'translations:sync
                            {--dry-run : Show what would be added without writing to DB}
                            {--path= : Path to scan for translation keys (default: ../client)}';

    protected $description = 'Scan frontend files for t("key", "fallback") calls and sync keys into the translations table';

    public function handle(): int
    {
        $basePath = $this->option('path')
            ? realpath($this->option('path'))
            : realpath(base_path('../client'));

        if (! $basePath || ! is_dir($basePath)) {
            $this->error("Client directory not found: {$basePath}");

            return self::FAILURE;
        }

        $this->info("Scanning: {$basePath}");

        $keys = $this->extractKeys($basePath);
        $this->info('Found '.count($keys).' unique translation keys.');

        if ($this->option('dry-run')) {
            $this->table(['Group', 'Key', 'Fallback (EN)'], array_map(
                fn ($k) => [$k['group'], $k['key'], $k['fallback']],
                $keys,
            ));

            return self::SUCCESS;
        }

        $localeCodes = Locale::query()->active()->pluck('code')->all();
        if (empty($localeCodes)) {
            $localeCodes = ['en', 'pl'];
        }

        $created = 0;
        foreach ($keys as $entry) {
            foreach ($localeCodes as $locale) {
                $value = $locale === 'en' ? $entry['fallback'] : '';

                $exists = Translation::query()->where([
                    'locale_code' => $locale,
                    'group' => $entry['group'],
                    'key' => $entry['key'],
                ])->exists();

                if (! $exists) {
                    Translation::create([
                        'locale_code' => $locale,
                        'group' => $entry['group'],
                        'key' => $entry['key'],
                        'value' => $value,
                    ]);
                    $created++;
                }
            }
        }

        foreach ($localeCodes as $locale) {
            Cache::forget("translations.{$locale}");
        }

        $this->info("Done. Created {$created} new entries.");

        return self::SUCCESS;
    }

    /**
     * @return array<int, array{group: string, key: string, fallback: string}>
     */
    private function extractKeys(string $basePath): array
    {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($basePath, FilesystemIterator::SKIP_DOTS),
        );

        $seen = [];
        $found = [];

        foreach ($files as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = $file->getExtension();
            if (! in_array($ext, ['ts', 'tsx'], true)) {
                continue;
            }

            $content = file_get_contents($file->getPathname());

            // Match: t("some.key", "Fallback text") — both single and double quotes
            preg_match_all(
                '/\bt\(\s*["\']([a-z][a-z0-9_]*\.[a-z][a-z0-9_.]*)["\'],\s*["\']([^"\']+)["\']\s*\)/u',
                $content,
                $matches,
                PREG_SET_ORDER,
            );

            foreach ($matches as $match) {
                $fullKey = $match[1];
                $fallback = $match[2];

                if (isset($seen[$fullKey])) {
                    continue;
                }

                $dotPos = mb_strpos($fullKey, '.');
                $group = mb_substr($fullKey, 0, $dotPos);
                $key = mb_substr($fullKey, $dotPos + 1);

                $seen[$fullKey] = true;
                $found[] = ['group' => $group, 'key' => $key, 'fallback' => $fallback];
            }
        }

        return $found;
    }
}
