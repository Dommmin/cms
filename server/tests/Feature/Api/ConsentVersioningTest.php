<?php

declare(strict_types=1);

use App\Models\Page;
use App\Services\LegalDocumentVersionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns computed consent version snapshot for guests', function (): void {
    $privacyPage = Page::factory()->published()->create([
        'title' => 'Privacy Policy',
        'system_page_key' => 'privacy_policy',
        'locale' => null,
        'content' => ['en' => '<p>Privacy v1</p>'],
    ]);

    $cookiePage = Page::factory()->published()->create([
        'title' => 'Cookie Policy',
        'system_page_key' => 'cookie_policy',
        'locale' => null,
        'content' => ['en' => '<p>Cookie v1</p>'],
    ]);

    $service = resolve(LegalDocumentVersionService::class);
    $service->syncPublishedPage($privacyPage);
    $service->syncPublishedPage($cookiePage);

    $response = $this->getJson('/api/v1/consent')
        ->assertOk();

    expect($response->json('consent_version'))->not->toBeNull();
    expect($response->json('policy_version_snapshot.privacy_policy'))->toBe('privacy_policy-v1');
    expect($response->json('policy_version_snapshot.cookie_policy'))->toBe('cookie_policy-v1');
});
