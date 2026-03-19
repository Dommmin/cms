<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Arr;

/**
 * Scans admin Inertia/React TSX files for t('key', 'fallback') calls
 * and syncs discovered keys into lang/{locale}/admin.php files.
 *
 * Usage:
 *   php artisan admin:sync-translations
 *   php artisan admin:sync-translations --dry-run
 *   php artisan admin:sync-translations --locale=pl
 */
class SyncAdminTranslations extends Command
{
    protected $signature = 'admin:sync-translations
        {--dry-run : Show what would change without writing files}
        {--locale= : Only process a specific locale}';

    protected $description = 'Sync translation keys from admin TSX files into lang/*/admin.php';

    /** Regex patterns to extract __('key', 'fallback') calls from TSX. */
    private const PATTERNS = [
        '/__\([\'"]([a-z][a-z0-9._-]+)[\'"](?:,\s*[\'"]([^\'"]*)[\'"]\s*)?\)/u',
    ];

    public function handle(): int
    {
        $isDryRun = (bool) $this->option('dry-run');
        $targetLocale = $this->option('locale');

        $scanDirs = [
            resource_path('js/pages/admin'),
            resource_path('js/components'),
        ];

        // --- 1. Collect all keys from TSX files ---
        /** @var array<string, string> $discovered key => fallback */
        $discovered = [];

        $files = [];
        foreach ($scanDirs as $scanDir) {
            $this->info('Scanning: ' . $scanDir);
            $files = array_merge($files, $this->getTsxFiles($scanDir));
        }
        foreach ($files as $file) {
            $content = file_get_contents($file);
            foreach (self::PATTERNS as $pattern) {
                if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
                    foreach ($matches as $match) {
                        $key = $match[1];
                        $fallback = $match[2] ?? '';
                        if (! isset($discovered[$key])) {
                            $discovered[$key] = $fallback;
                        }
                    }
                }
            }
        }

        $this->line(sprintf('Found <info>%d</info> translation keys across %d files.', count($discovered), count($files)));

        if (empty($discovered)) {
            $this->warn('No __() calls found. Make sure admin pages use useTranslation() hook.');

            return self::SUCCESS;
        }

        // --- 2. Load existing lang files and merge ---
        $langDir = lang_path();
        $localeDirs = glob($langDir . '/*', GLOB_ONLYDIR) ?: [];

        foreach ($localeDirs as $localeDir) {
            $locale = basename($localeDir);

            if ($targetLocale && $locale !== $targetLocale) {
                continue;
            }

            $langFile = $localeDir . '/admin.php';
            $existing = file_exists($langFile) ? (require $langFile) : [];
            $flat = Arr::dot($existing);

            $added = 0;
            foreach ($discovered as $key => $fallback) {
                if (! array_key_exists($key, $flat)) {
                    // For English, use the fallback; for others, leave empty
                    $flat[$key] = ($locale === 'en') ? $fallback : '';
                    $added++;
                }
            }

            if ($added === 0) {
                $this->line("  <comment>{$locale}</comment>: already up-to-date.");
                continue;
            }

            if ($isDryRun) {
                $this->line("  <comment>{$locale}</comment>: would add {$added} keys.");
                continue;
            }

            // Rebuild nested array from flat keys
            $nested = $this->unflatten($flat);
            ksort($nested);

            $this->writeLangFile($langFile, $nested, $locale);
            $this->line("  <info>{$locale}</info>: added {$added} new keys → {$langFile}");
        }

        $this->newLine();
        $this->info('Done. Remember to translate empty values in lang/*/admin.php');

        return self::SUCCESS;
    }

    /** @return string[] */
    private function getTsxFiles(string $dir): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir));
        foreach ($iterator as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['tsx', 'ts'], true)) {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }

    /**
     * Convert flat dot-notation array back to nested PHP array.
     *
     * @param  array<string, string>  $flat
     * @return array<string, mixed>
     */
    private function unflatten(array $flat): array
    {
        $result = [];
        foreach ($flat as $key => $value) {
            Arr::set($result, $key, $value);
        }

        return $result;
    }

    /**
     * Write a PHP lang file with proper formatting.
     *
     * @param  array<string, mixed>  $data
     */
    private function writeLangFile(string $path, array $data, string $locale): void
    {
        $header = <<<PHP
        <?php

        declare(strict_types=1);

        // Admin UI translations — {$locale}
        // Generated by: php artisan admin:sync-translations
        // Edit values here; keys are discovered automatically from admin TSX files.

        return
        PHP;

        $content = $header . "\n" . $this->arrayToPhp($data, 0) . ";\n";
        file_put_contents($path, $content);
    }

    /**
     * Convert array to PHP array syntax with indentation.
     *
     * @param  array<string, mixed>  $array
     */
    private function arrayToPhp(array $array, int $indent): string
    {
        $pad = str_repeat('    ', $indent);
        $innerPad = str_repeat('    ', $indent + 1);
        $lines = ["["];

        foreach ($array as $key => $value) {
            $escapedKey = "'" . addslashes((string) $key) . "'";
            if (is_array($value)) {
                $lines[] = $innerPad . $escapedKey . ' => ' . $this->arrayToPhp($value, $indent + 1) . ',';
            } else {
                $escapedValue = "'" . addslashes((string) $value) . "'";
                $lines[] = $innerPad . $escapedKey . ' => ' . $escapedValue . ',';
            }
        }

        $lines[] = $pad . ']';

        return implode("\n", $lines);
    }
}
