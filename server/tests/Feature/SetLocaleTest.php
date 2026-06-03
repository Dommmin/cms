<?php

declare(strict_types=1);

use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    Route::middleware(SetLocale::class)
        ->any('/_test/locale', fn () => response()->json(['locale' => app()->getLocale()]));
});

it('defaults to config locale when no query param or header is present', function (): void {
    $this->getJson('/_test/locale')
        ->assertOk()
        ->assertJson(['locale' => config('app.locale')]);
});

it('uses locale from query parameter', function (): void {
    $this->getJson('/_test/locale?locale=pl')
        ->assertOk()
        ->assertJson(['locale' => 'pl']);
});

it('uses locale from Accept-Language header', function (): void {
    $this->getJson('/_test/locale', [
        'HTTP_ACCEPT_LANGUAGE' => 'pl',
    ])
        ->assertOk()
        ->assertJson(['locale' => 'pl']);
});

it('gives priority to query parameter over Accept-Language header', function (): void {
    $this->getJson('/_test/locale?locale=pl', [
        'HTTP_ACCEPT_LANGUAGE' => 'en',
    ])
        ->assertOk()
        ->assertJson(['locale' => 'pl']);
});

it('falls back to default if unsupported locale in header', function (): void {
    $this->getJson('/_test/locale', [
        'HTTP_ACCEPT_LANGUAGE' => 'de',
    ])
        ->assertOk()
        ->assertJson(['locale' => config('app.locale')]);
});
