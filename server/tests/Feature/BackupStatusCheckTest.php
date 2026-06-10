<?php

declare(strict_types=1);

use App\Health\BackupStatusCheck;
use Illuminate\Support\Facades\Cache;
use Spatie\Health\Enums\Status;

beforeEach(function (): void {
    $filePath = storage_path('app/private/backup-status.json');
    if (file_exists($filePath)) {
        @unlink($filePath);
    }

    Cache::forget('database_backup:last_status');
});

afterEach(function (): void {
    $filePath = storage_path('app/private/backup-status.json');
    if (file_exists($filePath)) {
        @unlink($filePath);
    }
});

it('fails when no backup status exists', function (): void {
    $check = new BackupStatusCheck();
    $result = $check->run();

    expect($result->status->value)->toBe(Status::from('failed')->value);
    expect($result->notificationMessage)->toContain('No backup status record found');
});

it('fails when last backup status is failed', function (): void {
    $filePath = storage_path('app/private/backup-status.json');
    @mkdir(dirname($filePath), 0755, true);
    file_put_contents($filePath, json_encode([
        'last_backup_time' => now()->toIso8601String(),
        'status' => 'failed',
        'size' => 0,
    ]));

    $check = new BackupStatusCheck();
    $result = $check->run();

    expect($result->status->value)->toBe(Status::from('failed')->value);
    expect($result->notificationMessage)->toContain('failed');
});

it('fails when last backup is too old', function (): void {
    $filePath = storage_path('app/private/backup-status.json');
    @mkdir(dirname($filePath), 0755, true);
    file_put_contents($filePath, json_encode([
        'last_backup_time' => now()->subHours(27)->toIso8601String(),
        'status' => 'success',
        'size' => 1024,
    ]));

    $check = new BackupStatusCheck();
    $result = $check->run();

    expect($result->status->value)->toBe(Status::from('failed')->value);
    expect($result->notificationMessage)->toContain('hours ago');
});

it('succeeds when backup is fresh and successful', function (): void {
    $filePath = storage_path('app/private/backup-status.json');
    @mkdir(dirname($filePath), 0755, true);
    file_put_contents($filePath, json_encode([
        'last_backup_time' => now()->subHours(2)->toIso8601String(),
        'status' => 'success',
        'size' => 2 * 1024 * 1024, // 2MB
    ]));

    $check = new BackupStatusCheck();
    $result = $check->run();

    expect($result->status->value)->toBe(Status::from('ok')->value);
    expect($result->notificationMessage)->toContain('Last successful backup was 2 hours ago');
});

it('falls back to cache if status file does not exist', function (): void {
    Cache::put('database_backup:last_status', [
        'last_backup_time' => now()->subHours(3)->toIso8601String(),
        'status' => 'success',
        'size' => 5 * 1024 * 1024,
    ]);

    $check = new BackupStatusCheck();
    $result = $check->run();

    expect($result->status->value)->toBe(Status::from('ok')->value);
    expect($result->notificationMessage)->toContain('Last successful backup was 3 hours ago');
});
