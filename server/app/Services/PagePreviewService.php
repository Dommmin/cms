<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use App\Models\PagePreviewToken;
use App\Models\PageVersion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PagePreviewService
{
    public function createToken(Page $page, ?PageVersion $version = null, ?int $userId = null, int $ttlMinutes = 15): string
    {
        $token = Str::random(64);

        PagePreviewToken::query()->create([
            'page_id' => $page->id,
            'page_version_id' => $version?->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addMinutes($ttlMinutes),
            'created_by' => $userId ?? Auth::id(),
        ]);

        return $token;
    }

    public function findValidToken(string $token): ?PagePreviewToken
    {
        $hash = hash('sha256', $token);

        return PagePreviewToken::query()
            ->where('token_hash', $hash)
            ->where('expires_at', '>', now())
            ->first();
    }
}
