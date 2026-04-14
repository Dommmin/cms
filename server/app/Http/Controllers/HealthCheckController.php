<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthCheckController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'db' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'disk' => $this->checkDisk(),
        ];

        $allHealthy = ! in_array(false, $checks, strict: true);

        return new JsonResponse(
            data: [
                'status' => $allHealthy ? 'ok' : 'degraded',
                'checks' => $checks,
                'version' => config('app.version', 'unknown'),
                'slot' => config('app.slot', 'unknown'),
            ],
            status: $allHealthy ? 200 : 503,
        );
    }

    private function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function checkRedis(): bool
    {
        try {
            Redis::connection()->ping();

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function checkDisk(): bool
    {
        $storagePath = storage_path();
        $totalBytes = disk_total_space($storagePath);
        $freeBytes = disk_free_space($storagePath);

        if ($totalBytes === false || $freeBytes === false || $totalBytes === 0.0) {
            return false;
        }

        $freePercent = ($freeBytes / $totalBytes) * 100;

        return $freePercent > 10;
    }
}
