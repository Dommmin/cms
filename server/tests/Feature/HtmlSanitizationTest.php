<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Page;
use App\Models\Product;
use App\Services\HtmlSanitizerService;

describe('HtmlSanitizerService', function (): void {
    it('strips script tags from html', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        $malicious = '<p>Hello</p><script>alert(1)</script>';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('<script>')
            ->and($clean)->toContain('<p>Hello</p>');
    });

    it('strips javascript: href', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        $malicious = '<a href="javascript:alert(1)">click</a>';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('javascript:');
    });

    it('strips onerror event handlers', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        $malicious = '<img src="x" onerror="alert(1)">';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('onerror');
    });

    it('preserves allowed html tags', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        $html = '<p><strong>Bold</strong> and <em>italic</em></p><ul><li>item</li></ul>';
        $clean = $sanitizer->sanitize($html);

        expect($clean)->toContain('<strong>Bold</strong>')
            ->and($clean)->toContain('<em>italic</em>');
    });

    it('returns null for null input', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        expect($sanitizer->sanitize(null))->toBeNull();
    });

    it('sanitizes array values for given keys', function (): void {
        $sanitizer = app(HtmlSanitizerService::class);

        $data = [
            'title' => 'Safe title <script>alert(1)</script>',
            'content' => '<p>Good</p><script>bad()</script>',
            'order' => 1,
        ];

        $result = $sanitizer->sanitizeArray($data, ['content']);

        expect($result['title'])->toBe('Safe title <script>alert(1)</script>')
            ->and($result['content'])->not->toContain('<script>')
            ->and($result['order'])->toBe(1);
    });
});

describe('Product model HTML sanitization', function (): void {
    it('sanitizes description on save via api', function (): void {
        $user = \App\Models\User::factory()->admin()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->putJson("/api/v1/admin/products/{$product->id}", [
                'name' => ['en' => 'Test'],
                'description' => ['en' => '<p>Good</p><script>alert(1)</script>'],
                'short_description' => ['en' => 'short'],
            ]);

        $product->refresh();
        expect($product->getTranslation('description', 'en'))->not->toContain('<script>');
    });
});

describe('BlogPost model HTML sanitization', function (): void {
    it('strips script tags from content when set via setTranslation', function (): void {
        $post = BlogPost::factory()->make();
        $post->setTranslation('content', 'en', '<p>Text</p><script>alert(1)</script>');

        expect($post->getTranslation('content', 'en'))->not->toContain('<script>');
    });
});

describe('Page model HTML sanitization', function (): void {
    it('strips script tags from rich_content when set via setTranslation', function (): void {
        $page = Page::factory()->make();
        $page->setTranslation('rich_content', 'en', '<p>Text</p><script>alert(1)</script>');

        expect($page->getTranslation('rich_content', 'en'))->not->toContain('<script>');
    });
});
