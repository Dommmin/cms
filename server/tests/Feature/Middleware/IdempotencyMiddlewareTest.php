<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Cache::put('test:runs', 0);

    // A handler whose response changes on every execution, so a replayed
    // response (identical body) is distinguishable from a re-execution.
    $handler = fn (): mixed => response()
        ->json(['run' => Cache::increment('test:runs'), 'uuid' => Str::uuid()->toString()], 201)
        ->header('X-Custom', 'kept');

    Route::middleware('idempotent')->post('/_test/idempotency', $handler);
    Route::middleware('idempotent')->get('/_test/idempotency', $handler);

    Route::middleware('idempotent')->post(
        '/_test/idempotency-error',
        fn (): mixed => response()->json(['run' => Cache::increment('test:runs')], 500),
    );
});

it('replays the original response for a repeated key and identical payload', function (): void {
    $headers = ['Idempotency-Key' => 'key-123'];
    $payload = ['amount' => 100, 'currency' => 'pln'];

    $first = $this->postJson('/_test/idempotency', $payload, $headers);
    $second = $this->postJson('/_test/idempotency', $payload, $headers);

    $first->assertCreated();
    $second->assertCreated()
        ->assertExactJson($first->json())            // body restored verbatim
        ->assertHeader('X-Custom', 'kept')           // original headers restored
        ->assertHeader('X-Idempotent-Replayed', 'true');

    // The underlying handler executed exactly once.
    expect(Cache::get('test:runs'))->toBe(1);
});

it('ignores payload key ordering when comparing fingerprints', function (): void {
    $headers = ['Idempotency-Key' => 'key-order'];

    $this->postJson('/_test/idempotency', ['a' => 1, 'b' => 2], $headers)->assertCreated();
    $this->postJson('/_test/idempotency', ['b' => 2, 'a' => 1], $headers)
        ->assertCreated()
        ->assertHeader('X-Idempotent-Replayed', 'true');

    expect(Cache::get('test:runs'))->toBe(1);
});

it('rejects a reused key with a different payload', function (): void {
    $headers = ['Idempotency-Key' => 'key-conflict'];

    $this->postJson('/_test/idempotency', ['amount' => 100], $headers)->assertCreated();

    $this->postJson('/_test/idempotency', ['amount' => 999], $headers)
        ->assertStatus(422)
        ->assertJsonStructure(['message']);

    expect(Cache::get('test:runs'))->toBe(1);
});

it('does not cache when no Idempotency-Key is sent', function (): void {
    $first = $this->postJson('/_test/idempotency', ['amount' => 100]);
    $second = $this->postJson('/_test/idempotency', ['amount' => 100]);

    expect($first->json('uuid'))->not->toBe($second->json('uuid'));
    expect(Cache::get('test:runs'))->toBe(2);
});

it('never caches non-POST requests', function (): void {
    $headers = ['Idempotency-Key' => 'key-get'];

    $first = $this->getJson('/_test/idempotency', $headers);
    $second = $this->getJson('/_test/idempotency', $headers);

    expect($first->json('uuid'))->not->toBe($second->json('uuid'));
    $second->assertHeaderMissing('X-Idempotent-Replayed');
});

it('scopes cached responses per authenticated user', function (): void {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $headers = ['Idempotency-Key' => 'shared-key'];
    $payload = ['amount' => 100];

    $a = $this->actingAs($userA)->postJson('/_test/idempotency', $payload, $headers);
    $b = $this->actingAs($userB)->postJson('/_test/idempotency', $payload, $headers);

    // Same key, same payload, different principals → no cross-user replay.
    $b->assertHeaderMissing('X-Idempotent-Replayed');

    expect($a->json('uuid'))->not->toBe($b->json('uuid'));
    expect(Cache::get('test:runs'))->toBe(2);
});

it('does not cache server errors so they remain retryable', function (): void {
    $headers = ['Idempotency-Key' => 'key-500'];

    $this->postJson('/_test/idempotency-error', [], $headers)->assertStatus(500);
    $this->postJson('/_test/idempotency-error', [], $headers)->assertStatus(500);

    expect(Cache::get('test:runs'))->toBe(2);
});

it('returns 409 while an identical request is still in flight', function (): void {
    config(['idempotency.lock_wait_seconds' => 0]); // give up immediately instead of blocking

    $idempotencyKey = 'key-inflight';
    $path = '_test/idempotency';
    $scope = 'ip:'.hash('sha256', '127.0.0.1');
    $cacheKey = 'idempotency:'.hash('sha256', implode('|', [$idempotencyKey, $scope, $path]));

    // Simulate a concurrent request holding the lock.
    Cache::lock($cacheKey.':lock', 90)->get();

    $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
        ->postJson('/_test/idempotency', ['amount' => 100], ['Idempotency-Key' => $idempotencyKey])
        ->assertStatus(409)
        ->assertJsonStructure(['message']);

    expect(Cache::get('test:runs'))->toBe(0);
});

it('rejects an Idempotency-Key that exceeds the maximum length', function (): void {
    $this->postJson('/_test/idempotency', ['amount' => 100], ['Idempotency-Key' => str_repeat('a', 256)])
        ->assertStatus(400)
        ->assertJsonStructure(['message']);

    expect(Cache::get('test:runs'))->toBe(0);
});

it('does not replay Set-Cookie headers from the cached response', function (): void {
    Route::middleware('idempotent')->post(
        '/_test/idempotency-cookie',
        fn (): mixed => response()
            ->json(['run' => Cache::increment('test:runs')], 201)
            ->cookie('demo_session', 'secret-value'),
    );

    $headers = ['Idempotency-Key' => 'key-cookie'];

    $this->postJson('/_test/idempotency-cookie', [], $headers)->assertCreated();

    $this->postJson('/_test/idempotency-cookie', [], $headers)
        ->assertCreated()
        ->assertHeader('X-Idempotent-Replayed', 'true')
        ->assertHeaderMissing('Set-Cookie');

    expect(Cache::get('test:runs'))->toBe(1);
});

it('replays a JSON body verbatim behind ForceJsonResponse instead of re-wrapping it', function (): void {
    // Mirror the real API stack: ForceJsonResponse wraps the route, idempotent
    // runs inside it. A plain replayed Response would be re-wrapped into an
    // error envelope; a JsonResponse must pass through untouched.
    Route::middleware(['force.json', 'idempotent'])->post(
        '/_test/idempotency-json',
        fn (): mixed => response()->json(['run' => Cache::increment('test:runs'), 'order' => 'ORD-1'], 201),
    );

    $headers = ['Idempotency-Key' => 'key-json-passthrough'];

    $first = $this->postJson('/_test/idempotency-json', ['amount' => 100], $headers);
    $second = $this->postJson('/_test/idempotency-json', ['amount' => 100], $headers);

    $first->assertCreated();
    $second->assertCreated()
        ->assertHeader('X-Idempotent-Replayed', 'true')
        ->assertExactJson($first->json())          // not the {success:false,...} envelope
        ->assertJsonPath('order', 'ORD-1');

    expect(Cache::get('test:runs'))->toBe(1);
});

it('does not cache responses larger than the configured limit', function (): void {
    config(['idempotency.max_body_length' => 10]);

    Route::middleware('idempotent')->post(
        '/_test/idempotency-big',
        fn (): mixed => response()->json([
            'run' => Cache::increment('test:runs'),
            'pad' => str_repeat('x', 64),
        ]),
    );

    $headers = ['Idempotency-Key' => 'key-big'];

    $this->postJson('/_test/idempotency-big', [], $headers);
    $this->postJson('/_test/idempotency-big', [], $headers);

    // Body exceeded the limit → never cached → handler ran twice.
    expect(Cache::get('test:runs'))->toBe(2);
});
