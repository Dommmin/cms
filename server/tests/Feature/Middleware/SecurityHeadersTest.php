<?php

declare(strict_types=1);

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;

beforeEach(function (): void {
    Route::get('/_test_security_headers_html', fn (): ResponseFactory|Response => response('<html><head></head><body>Hello</body></html>', 200, ['Content-Type' => 'text/html']));

    Route::get('/_test_security_headers_json', fn () => response()->json(['status' => 'ok']));
});

it('applies standard security headers to HTML responses', function (): void {
    $response = $this->get('/_test_security_headers_html');

    $response->assertStatus(200);
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    $response->assertHeader('Content-Security-Policy');
});

it('applies standard security headers to JSON responses but omits CSP', function (): void {
    $response = $this->get('/_test_security_headers_json');

    $response->assertStatus(200);
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    $response->assertHeaderMissing('Content-Security-Policy');
});

it('generates and matches the Vite dynamic nonce in CSP', function (): void {
    $response = $this->get('/_test_security_headers_html');

    $response->assertStatus(200);

    $csp = $response->headers->get('Content-Security-Policy');
    expect($csp)->not->toBeNull();

    $nonce = Vite::cspNonce();
    expect($nonce)->not->toBeNull();
    expect($csp)->toContain(sprintf("script-src 'self' 'nonce-%s'", $nonce));
});
