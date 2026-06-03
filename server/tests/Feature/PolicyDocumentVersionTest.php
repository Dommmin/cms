<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PolicyDocumentVersion;
use App\Services\LegalDocumentVersionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a policy document version for published legal pages', function (): void {
    $page = Page::factory()->published()->create([
        'title' => 'Terms of Service',
        'system_page_key' => 'terms_of_service',
        'locale' => null,
        'content' => ['en' => '<p>Terms v1</p>'],
    ]);

    $version = resolve(LegalDocumentVersionService::class)->syncPublishedPage($page);

    expect($version)->not->toBeNull();
    expect($version?->version_label)->toBe('terms_of_service-v1');

    $this->assertDatabaseHas('policy_document_versions', [
        'page_id' => $page->id,
        'system_page_key' => 'terms_of_service',
        'revision' => 1,
        'is_current' => true,
    ]);
});

it('does not create a new revision when published content did not change', function (): void {
    $page = Page::factory()->published()->create([
        'title' => 'Privacy Policy',
        'system_page_key' => 'privacy_policy',
        'locale' => null,
        'content' => ['en' => '<p>Privacy v1</p>'],
    ]);

    $service = resolve(LegalDocumentVersionService::class);

    $service->syncPublishedPage($page);
    $service->syncPublishedPage($page->fresh());

    expect(PolicyDocumentVersion::query()->count())->toBe(1);
});
