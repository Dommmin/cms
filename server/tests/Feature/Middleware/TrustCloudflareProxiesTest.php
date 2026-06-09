<?php

declare(strict_types=1);

use App\Http\Middleware\TrustCloudflareProxies;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\App;

it('trusts CF-Connecting-IP when remote address is a Cloudflare IP', function (): void {
    App::detectEnvironment(fn (): string => 'production');

    $request = new Request();
    $request->server->set('REMOTE_ADDR', '108.162.192.1'); // Cloudflare IPv4
    $request->headers->set('CF-Connecting-IP', '198.51.100.5');

    $middleware = new TrustCloudflareProxies();
    $middleware->handle($request, function ($req): ResponseFactory|Response {
        expect($req->ip())->toBe('198.51.100.5');

        return response('ok');
    });

    $requestV6 = new Request();
    $requestV6->server->set('REMOTE_ADDR', '2606:4700::1'); // Cloudflare IPv6
    $requestV6->headers->set('CF-Connecting-IP', '2001:db8::5');

    $middleware->handle($requestV6, function ($req): ResponseFactory|Response {
        expect($req->ip())->toBe('2001:db8::5');

        return response('ok');
    });
});

it('does not trust CF-Connecting-IP when remote address is NOT a Cloudflare IP', function (): void {
    App::detectEnvironment(fn (): string => 'production');

    $request = new Request();
    $request->server->set('REMOTE_ADDR', '203.0.113.1'); // Arbitrary public IP
    $request->headers->set('CF-Connecting-IP', '198.51.100.5');

    $middleware = new TrustCloudflareProxies();
    $middleware->handle($request, function ($req): ResponseFactory|Response {
        expect($req->ip())->toBe('203.0.113.1');

        return response('ok');
    });
});

it('trusts loopback and private subnets in local or testing environments', function (): void {
    App::detectEnvironment(fn (): string => 'testing');

    $request = new Request();
    $request->server->set('REMOTE_ADDR', '172.18.0.5'); // Common Docker subnet IP
    $request->headers->set('CF-Connecting-IP', '198.51.100.5');

    $middleware = new TrustCloudflareProxies();
    $middleware->handle($request, function ($req): ResponseFactory|Response {
        expect($req->ip())->toBe('198.51.100.5');

        return response('ok');
    });

    $requestLocal = new Request();
    $requestLocal->server->set('REMOTE_ADDR', '127.0.0.1');
    $requestLocal->headers->set('CF-Connecting-IP', '198.51.100.5');

    $middleware->handle($requestLocal, function ($req): ResponseFactory|Response {
        expect($req->ip())->toBe('198.51.100.5');

        return response('ok');
    });
});
