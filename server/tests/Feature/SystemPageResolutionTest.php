<?php

declare(strict_types=1);

use App\Models\Page;

it('returns a published page by system page key', function (): void {
    Page::factory()->published()->create([
        'system_page_key' => 'privacy_policy',
        'locale' => null,
        'title' => ['en' => 'Privacy Policy'],
        'slug' => ['en' => 'privacy-policy'],
    ]);

    $response = $this->getJson('/api/v1/pages/system/privacy_policy');

    $response
        ->assertOk()
        ->assertJsonPath('system_page_key', 'privacy_policy')
        ->assertJsonPath('title', 'Privacy Policy');
});

it('prefers locale specific system page over global fallback', function (): void {
    Page::factory()->published()->create([
        'system_page_key' => 'terms_of_service',
        'locale' => null,
        'title' => ['en' => 'Global Terms'],
        'slug' => ['en' => 'terms-global'],
    ]);

    Page::factory()->published()->create([
        'system_page_key' => 'terms_of_service',
        'locale' => 'en',
        'title' => ['en' => 'English Terms'],
        'slug' => ['en' => 'terms-en'],
    ]);

    $response = $this->getJson('/api/v1/pages/system/terms_of_service');

    $response
        ->assertOk()
        ->assertJsonPath('title', 'English Terms')
        ->assertJsonPath('system_page_key', 'terms_of_service');
});
