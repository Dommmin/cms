<?php

declare(strict_types=1);

namespace App\Health;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Spatie\Health\Checks\Check;
use Spatie\Health\Checks\Result;

class BackupStatusCheck extends Check
{
    public function run(): Result
    {
        $statusData = $this->getBackupStatus();

        if ($statusData === null) {
            return Result::make()->failed('No backup status record found. Database backup might not have run yet.');
        }

        $lastBackup = Carbon::parse($statusData['last_backup_time']);
        $hoursSinceBackup = (int) now()->diffInHours($lastBackup, true);
        $status = $statusData['status'];

        if ($status === 'failed') {
            return Result::make()->failed("The last backup attempted on {$lastBackup->toDateTimeString()} UTC failed.");
        }

        if ($hoursSinceBackup > 26) {
            return Result::make()->failed("Last backup was {$hoursSinceBackup} hours ago (fresh backup expected within 26 hours).");
        }

        if ($hoursSinceBackup > 25) {
            return Result::make()->warning("Last backup was {$hoursSinceBackup} hours ago.");
        }

        $sizeMb = isset($statusData['size']) ? round($statusData['size'] / 1024 / 1024, 2) : 0;
        return Result::make()->ok("Last successful backup was {$hoursSinceBackup} hours ago (Size: {$sizeMb} MB).");
    }

    /**
     * @return array{last_backup_time: string, status: string, size?: int}|null
     */
    protected function getBackupStatus(): ?array
    {
        // 1. Try reading the local JSON file
        $filePath = storage_path('app/private/backup-status.json');
        if (file_exists($filePath)) {
            try {
                $content = file_get_contents($filePath);
                if ($content) {
                    $decoded = json_decode($content, true);
                    if (is_array($decoded) && isset($decoded['last_backup_time'], $decoded['status'])) {
                        return $decoded;
                    }
                }
            } catch (\Throwable) {
                // Ignore and fall back to cache
            }
        }

        // 2. Fall back to cache key
        $cacheData = Cache::get('database_backup:last_status');
        if (is_array($cacheData) && isset($cacheData['last_backup_time'], $cacheData['status'])) {
            return $cacheData;
        }

        return null;
    }
}
