<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Passkeys\Actions\DeletePasskey;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Actions\StorePasskey;
use Laravel\Passkeys\Actions\VerifyPasskey;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;
use Throwable;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialRequestOptions;

class PasskeyApiController extends ApiController
{
    /**
     * List user's registered passkeys.
     */
    public function index(Request $request): JsonResponse
    {
        $passkeys = Passkey::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->ok($passkeys->toArray());
    }

    /**
     * Get passkey registration options.
     */
    public function registerOptions(Request $request, GenerateRegistrationOptions $generate): JsonResponse
    {
        $user = $request->user();
        $options = $generate($user);

        $serialized = WebAuthn::toJson($options);

        // Store options in cache statelessly for 10 minutes
        cache()->put('passkey_reg_options_'.$user->id, $serialized, now()->addMinutes(10));

        return response()->json([
            'options' => WebAuthn::toBrowserArray($options),
        ]);
    }

    /**
     * Register a new passkey.
     */
    public function register(
        Request $request,
        StorePasskey $storePasskey
    ): JsonResponse {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credential' => ['required', 'array'],
        ]);

        $user = $request->user();
        $serializedOptions = cache()->pull('passkey_reg_options_'.$user->id);

        if (! $serializedOptions) {
            throw ValidationException::withMessages([
                'credential' => [__('Passkey registration session expired. Please try again.')],
            ]);
        }

        try {
            $options = WebAuthn::fromJson($serializedOptions, PublicKeyCredentialCreationOptions::class);
            $credential = WebAuthn::fromJson(
                json_encode($request->input('credential')) ?: '{}',
                PublicKeyCredential::class
            );

            $passkey = $storePasskey(
                $user,
                $request->string('name')->toString(),
                $credential,
                $options
            );

            return $this->created([
                'message' => 'Passkey registered successfully.',
                'passkey' => $passkey,
            ]);
        } catch (Throwable $throwable) {
            throw ValidationException::withMessages([
                'credential' => [$throwable->getMessage() ?: __('Failed to verify and register passkey.')],
            ]);
        }
    }

    /**
     * Delete a passkey.
     */
    public function destroy(
        int $id,
        Request $request,
        DeletePasskey $deletePasskey
    ): JsonResponse {
        $user = $request->user();
        $passkey = Passkey::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $deletePasskey($user, $passkey);

        return $this->ok([
            'message' => 'Passkey deleted successfully.',
        ]);
    }

    /**
     * Get passkey login options.
     */
    public function loginOptions(Request $request, GenerateVerificationOptions $generate): JsonResponse
    {
        $options = $generate();

        $serialized = WebAuthn::toJson($options);
        $challengeId = Str::random(40);

        // Store options in cache statelessly for 10 minutes
        cache()->put('passkey_login_options_'.$challengeId, $serialized, now()->addMinutes(10));

        return response()->json([
            'challenge_id' => $challengeId,
            'options' => WebAuthn::toBrowserArray($options),
        ]);
    }

    /**
     * Verify passkey and log in.
     */
    public function login(
        Request $request,
        VerifyPasskey $verify
    ): JsonResponse {
        $request->validate([
            'challenge_id' => ['required', 'string'],
            'credential' => ['required', 'array'],
        ]);

        $serializedOptions = cache()->pull('passkey_login_options_'.$request->challenge_id);

        if (! $serializedOptions) {
            throw ValidationException::withMessages([
                'credential' => [__('Passkey verification session expired. Please try again.')],
            ]);
        }

        try {
            $options = WebAuthn::fromJson($serializedOptions, PublicKeyCredentialRequestOptions::class);
            $credential = WebAuthn::fromJson(
                json_encode($request->input('credential')) ?: '{}',
                PublicKeyCredential::class
            );

            $passkey = $verify($credential, $options);

            if (! Passkeys::allowsLogin($request, $passkey)) {
                throw ValidationException::withMessages([
                    'credential' => [__('Unable to sign in with this account.')],
                ]);
            }

            /** @var User $user */
            $user = $passkey->user;

            $token = $user->createToken('api')->plainTextToken;

            return $this->ok([
                'user' => new UserResource($user),
                'token' => $token,
            ]);
        } catch (Throwable $throwable) {
            throw ValidationException::withMessages([
                'credential' => [$throwable->getMessage() ?: __('Failed to authenticate using passkey.')],
            ]);
        }
    }
}
