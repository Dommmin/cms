<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialLoginController extends Controller
{
    private const array ALLOWED_PROVIDERS = ['google', 'github'];

    public function redirect(string $provider): JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return response()->json(['message' => 'Unsupported provider.'], 422);
        }

        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function callback(string $provider): JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return response()->json(['message' => 'Unsupported provider.'], 422);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable) {
            return response()->json(['message' => 'Social authentication failed.'], 422);
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

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
