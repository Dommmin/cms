<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialLoginController extends ApiController
{
    private const array ALLOWED_PROVIDERS = ['google', 'github'];

    public function redirect(string $provider): JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            throw ValidationException::withMessages([
                'provider' => ['Unsupported provider.'],
            ]);
        }

        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return $this->ok(['url' => $url]);
    }

    public function callback(string $provider): JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            throw ValidationException::withMessages([
                'provider' => ['Unsupported provider.'],
            ]);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'provider' => ['Social authentication failed.'],
            ]);
        }

        $providerIdField = $provider.'_id';

        /** @var User|null $user */
        $user = User::query()
            ->where($providerIdField, $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if ($user) {
            $user->update([
                $providerIdField => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
            ]);
        } else {
            $user = User::query()->create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail(),
                'password' => Hash::make(Str::random(32)),
                $providerIdField => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
            ]);

            $user->markEmailAsVerified();
        }

        $token = $user->createToken('api')->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
