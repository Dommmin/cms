<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use App\Services\HtmlSanitizerService;
use Spatie\Permission\Models\Role;

describe('HtmlSanitizerService', function (): void {
    it('strips script tags from html', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $malicious = '<p>Hello</p><script>alert(1)</script>';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('<script>')
            ->and($clean)->toContain('<p>Hello</p>');
    });

    it('strips javascript: href', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $malicious = '<a href="javascript:alert(1)">click</a>';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('javascript:');
    });

    it('strips onerror event handlers', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $malicious = '<img src="x" onerror="alert(1)">';
        $clean = $sanitizer->sanitize($malicious);

        expect($clean)->not->toContain('onerror');
    });

    it('preserves allowed html tags', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $html = '<p><strong>Bold</strong> and <em>italic</em></p><ul><li>item</li></ul>';
        $clean = $sanitizer->sanitize($html);

        expect($clean)->toContain('<strong>Bold</strong>')
            ->and($clean)->toContain('<em>italic</em>');
    });

    it('preserves enterprise RTE media, attachment and table markup while stripping unsafe attributes', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $html = '<figure data-rte-gallery="true" data-columns="3" onclick="alert(1)"><figure data-gallery-item="true" data-media-id="7"><img src="/storage/a.jpg" alt="A" loading="lazy" data-focal-point="{&quot;x&quot;:0.5,&quot;y&quot;:0.5}" onerror="bad()"><figcaption>Caption</figcaption></figure></figure><a href="/en/file.pdf" target="_blank" rel="noopener noreferrer" data-rte-attachment="true" data-file-name="file.pdf">Download</a><table><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>';
        $clean = $sanitizer->sanitize($html);

        expect($clean)->toContain('data-rte-gallery="true"')
            ->and($clean)->toContain('data-gallery-item="true"')
            ->and($clean)->toContain('loading="lazy"')
            ->and($clean)->toContain('data-rte-attachment="true"')
            ->and($clean)->toContain('<table>')
            ->and($clean)->not->toContain('onclick')
            ->and($clean)->not->toContain('onerror');
    });

    it('preserves safe RTE embeds and strips unsafe iframe sources', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        $html = '<figure data-rte-embed="true" data-embed-platform="vimeo"><iframe src="https://player.vimeo.com/video/123456" title="Vimeo video" loading="lazy" allowfullscreen="true" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe><figcaption>Vimeo</figcaption></figure><figure data-rte-embed="true" data-embed-platform="instagram"><a href="https://www.instagram.com/p/abc123/" target="_blank" rel="noopener noreferrer">View Instagram post</a><figcaption>Instagram</figcaption></figure><iframe src="https://evil.test/embed/1"></iframe><iframe src="https://www.instagram.com/p/abc123/embed"></iframe><iframe src="https://x.com/example/status/123456789"></iframe>';
        $clean = $sanitizer->sanitize($html);

        expect($clean)->toContain('data-rte-embed="true"')
            ->and($clean)->toContain('data-embed-platform="vimeo"')
            ->and($clean)->toContain('https://player.vimeo.com/video/123456')
            ->and($clean)->toContain('data-embed-platform="instagram"')
            ->and($clean)->toContain('https://www.instagram.com/p/abc123/')
            ->and($clean)->toContain('sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"')
            ->and($clean)->not->toContain('https://evil.test/embed/1')
            ->and($clean)->not->toContain('https://www.instagram.com/p/abc123/embed')
            ->and($clean)->not->toContain('https://x.com/example/status/123456789');
    });

    it('returns null for null input', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

        expect($sanitizer->sanitize(null))->toBeNull();
    });

    it('sanitizes array values for given keys', function (): void {
        $sanitizer = resolve(HtmlSanitizerService::class);

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
        Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('admin');

        $product = Product::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/v1/admin/products/'.$product->id, [
                'name' => ['en' => 'Test'],
                'description' => ['en' => '<p>Good</p><script>alert(1)</script>'],
                'short_description' => ['en' => 'short'],
            ]);

        $product->refresh();
        expect($product->getTranslation('description', 'en'))->not->toContain('<script>');
    });
});

describe('BlogPost model HTML sanitization', function (): void {
    it('stores canonical RTE JSON alongside rendered content', function (): void {
        $json = ['en' => '{"root":{"type":"root","children":[]}}'];

        $post = BlogPost::factory()->create([
            'content' => ['en' => '<p>Text</p>'],
            'content_json' => $json,
        ]);

        expect($post->content_json)->toBe($json);
    });

    it('strips script tags from content on create', function (): void {
        $post = BlogPost::factory()->create([
            'content' => ['en' => '<p>Text</p><script>alert(1)</script>'],
        ]);

        expect($post->getTranslation('content', 'en'))->not->toContain('<script>')
            ->and($post->getTranslation('content', 'en'))->toContain('<p>Text</p>');
    });

    it('strips script tags from content on update', function (): void {
        $post = BlogPost::factory()->create();
        $post->setTranslations('content', ['en' => '<p>Text</p><script>alert(1)</script>']);
        $post->save();

        $post->refresh();

        expect($post->getTranslation('content', 'en'))->not->toContain('<script>');
    });
});

describe('Page model HTML sanitization', function (): void {
    it('strips script tags from rich_content on create', function (): void {
        $page = Page::factory()->create([
            'rich_content' => ['en' => '<p>Text</p><script>alert(1)</script>'],
        ]);

        expect($page->getTranslation('rich_content', 'en'))->not->toContain('<script>')
            ->and($page->getTranslation('rich_content', 'en'))->toContain('<p>Text</p>');
    });

    it('strips script tags from rich_content on update', function (): void {
        $page = Page::factory()->create();
        $page->setTranslations('rich_content', ['en' => '<p>Text</p><script>alert(1)</script>']);
        $page->save();

        $page->refresh();

        expect($page->getTranslation('rich_content', 'en'))->not->toContain('<script>');
    });
});
