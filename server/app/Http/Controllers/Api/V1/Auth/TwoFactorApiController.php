<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

class TwoFactorApiController extends ApiController
{
    /**
     * Get the 2FA QR code and secret key.
     */
    public function qrCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->two_factor_secret) {
            throw ValidationException::withMessages([
                'two_factor' => [__('Two-factor authentication is not enabled.')],
            ]);
        }

        return $this->ok([
            'svg' => $user->twoFactorQrCodeSvg(),
            'secret' => decrypt($user->two_factor_secret),
        ]);
    }

    /**
     * Get the user's 2FA recovery codes.
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->two_factor_secret) {
            throw ValidationException::withMessages([
                'two_factor' => [__('Two-factor authentication is not enabled.')],
            ]);
        }

        return $this->ok($user->recoveryCodes());
    }

    /**
     * Enable 2FA for the user.
     */
    public function enable(Request $request, EnableTwoFactorAuthentication $enable): JsonResponse
    {
        $enable($request->user(), $request->boolean('force', false));

        $user = $request->user();

        return $this->ok([
            'svg' => $user->twoFactorQrCodeSvg(),
            'secret' => decrypt($user->two_factor_secret),
        ]);
    }

    /**
     * Confirm 2FA configuration with a code.
     */
    public function confirm(Request $request, ConfirmTwoFactorAuthentication $confirm): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $confirm($request->user(), $request->code);

        return $this->ok([
            'message' => 'Two-factor authentication confirmed successfully.',
            'recovery_codes' => $request->user()->recoveryCodes(),
        ]);
    }

    /**
     * Disable 2FA.
     */
    public function disable(Request $request, DisableTwoFactorAuthentication $disable): JsonResponse
    {
        $disable($request->user());

        return $this->ok([
            'message' => 'Two-factor authentication disabled successfully.',
        ]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $regenerate): JsonResponse
    {
        $regenerate($request->user());

        return $this->ok($request->user()->recoveryCodes());
    }

    /**
     * Verify a 2FA challenge during login.
     */
    public function challenge(Request $request, TwoFactorAuthenticationProvider $provider): JsonResponse
    {
        $request->validate([
            'challenge_token' => ['required', 'string'],
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $cacheKey = '2fa_challenge_'.$request->challenge_token;
        $userId = cache()->get($cacheKey);

        if (! $userId) {
            throw ValidationException::withMessages([
                'code' => ['The challenge token is invalid or has expired.'],
            ]);
        }

        $user = User::query()->findOrFail($userId);

        if ($request->code) {
            $decryptedSecret = decrypt($user->two_factor_secret);
            if (! $provider->verify($decryptedSecret, $request->code)) {
                throw ValidationException::withMessages([
                    'code' => ['The provided two factor authentication code was invalid.'],
                ]);
            }
        } elseif ($request->recovery_code) {
            $recoveryCodes = $user->recoveryCodes();
            $matchedCode = collect($recoveryCodes)->first(fn ($code): bool => hash_equals($code, $request->recovery_code));

            if (! $matchedCode) {
                throw ValidationException::withMessages([
                    'recovery_code' => ['The provided recovery code was invalid.'],
                ]);
            }

            $user->replaceRecoveryCode($matchedCode);
        } else {
            throw ValidationException::withMessages([
                'code' => ['Either verification code or recovery code is required.'],
            ]);
        }

        // Authentication successful
        cache()->forget($cacheKey);

        $token = $user->createToken('api')->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
