<?php

declare(strict_types=1);

use App\Http\Middleware\Idempotency\IdempotencyRecord;

it('round-trips through toArray and fromCache', function (): void {
    $record = new IdempotencyRecord(
        fingerprint: 'abc123',
        body: '{"ok":true}',
        status: 201,
        headers: ['Content-Type' => ['application/json'], 'X-Custom' => ['kept']],
        createdAt: '2026-06-19T10:00:00+00:00',
    );

    $restored = IdempotencyRecord::fromCache($record->toArray());

    expect($restored)->not->toBeNull()
        ->and($restored->fingerprint)->toBe('abc123')
        ->and($restored->body)->toBe('{"ok":true}')
        ->and($restored->status)->toBe(201)
        ->and($restored->headers)->toBe(['Content-Type' => ['application/json'], 'X-Custom' => ['kept']])
        ->and($restored->createdAt)->toBe('2026-06-19T10:00:00+00:00');
});

it('returns null for corrupt or malformed cache values', function (mixed $value): void {
    expect(IdempotencyRecord::fromCache($value))->toBeNull();
})->with([
    'null' => [null],
    'plain string' => ['not-an-array'],
    'integer' => [42],
    'empty array' => [[]],
    'missing keys' => [['fingerprint' => 'x']],
    'wrong status type' => [[
        'fingerprint' => 'x',
        'body' => '{}',
        'status' => 'oops',
        'headers' => [],
        'created_at' => '2026-06-19T10:00:00+00:00',
    ]],
    'headers not array' => [[
        'fingerprint' => 'x',
        'body' => '{}',
        'status' => 200,
        'headers' => 'nope',
        'created_at' => '2026-06-19T10:00:00+00:00',
    ]],
]);
