<?php

declare(strict_types=1);

use Illuminate\Support\Facades\App;

it('allows access to debug-glitchtip and throws exception in testing environment', function (): void {
    App::detectEnvironment(fn () => 'testing');

    $this->expectException(Exception::class);
    $this->expectExceptionMessage('Test GlitchTip error!');

    $this->withoutExceptionHandling()
        ->get('/debug-glitchtip');
});

it('returns 404 for debug-glitchtip in production environment', function (): void {
    App::detectEnvironment(fn () => 'production');

    $this->get('/debug-glitchtip')
        ->assertStatus(404);
});
