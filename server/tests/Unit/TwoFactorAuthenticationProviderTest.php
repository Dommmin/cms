<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider as TwoFactorAuthenticationProviderContract;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

uses(TestCase::class);

it('accepts a recent two factor code within the configured time window', function (): void {
    Config::set('fortify-options.two-factor-authentication.window', 2);

    $google2fa = new Google2FA();
    $provider = resolve(TwoFactorAuthenticationProviderContract::class);
    $secret = Str::upper($google2fa->generateSecretKey(16));
    $currentTimestamp = $google2fa->getTimestamp();
    $code = $google2fa->oathTotp($secret, $currentTimestamp - 2);

    expect($provider->verify($secret, $code))->toBeTrue();
});
