<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Support\UserAgentParser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionApiController extends ApiController
{
    /**
     * List active sessions (Sanctum tokens) for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $sessions = $user->tokens()
            ->latest()
            ->get()
            ->map(function ($token) use ($currentTokenId): array {
                $uaInfo = UserAgentParser::parse((string) $token->user_agent);

                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'ip_address' => $token->ip_address,
                    'user_agent' => $token->user_agent,
                    'device' => $uaInfo['device'],
                    'platform' => $uaInfo['platform'],
                    'browser' => $uaInfo['browser'],
                    'last_used_at' => $token->last_used_at,
                    'created_at' => $token->created_at,
                    'is_current' => $token->id === $currentTokenId,
                ];
            });

        return $this->ok($sessions->all());
    }

    /**
     * Revoke a specific session.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $token = $user->tokens()->findOrFail($id);
        $token->delete();

        return $this->ok([
            'message' => 'Session terminated successfully.',
        ]);
    }

    /**
     * Revoke all sessions except the current one.
     */
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return $this->ok([
            'message' => 'All other sessions terminated successfully.',
        ]);
    }
}
