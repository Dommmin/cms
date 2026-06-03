<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PrivacyRequest;
use App\Models\User;

class PrivacyRequestService
{
    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function logCompleted(
        User $user,
        string $type,
        ?array $payload = null,
        ?string $resolutionNote = null,
    ): PrivacyRequest {
        return PrivacyRequest::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'status' => 'completed',
            'email' => $user->email,
            'payload' => $payload,
            'resolution_note' => $resolutionNote,
            'requested_at' => now(),
            'resolved_at' => now(),
        ]);
    }
}
