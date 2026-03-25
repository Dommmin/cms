<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class BlogFeedController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $locale = $request->query('locale', config('app.locale', 'en'));

        $cacheKey = 'blog_rss_feed_'.$locale;

        $xml = Cache::remember($cacheKey, 3600, fn (): string => $this->buildFeed($locale));

        return response($xml, 200, [
            'Content-Type' => 'application/rss+xml; charset=UTF-8',
        ]);
    }

    private function buildFeed(string $locale): string
    {
        $posts = BlogPost::query()
            ->published()
            ->when($locale, function ($query) use ($locale): void {
                $query->where(function ($q) use ($locale): void {
                    $q->whereNull('available_locales')
                        ->orWhereJsonContains('available_locales', $locale);
                });
            })
            ->with('author')
            ->latest('published_at')
            ->limit(50)
            ->get();

        $siteUrl = config('app.url');
        $feedUrl = url(route('blog.feed'));
        $title = e(config('app.name').' – Blog');
        $now = now()->toRfc2822String();

        $items = $posts->map(function (BlogPost $post) use ($siteUrl, $locale): string {
            $postTitle = e($post->getTranslation('title', $locale, false) ?: $post->getTranslation('title', 'en', false) ?: $post->title);
            $excerpt = e($post->getTranslation('excerpt', $locale, false) ?: $post->getTranslation('excerpt', 'en', false) ?: $post->excerpt ?? '');
            $link = e(sprintf('%s/blog/%s', $siteUrl, $post->slug));
            $pubDate = $post->published_at?->toRfc2822String() ?? now()->toRfc2822String();
            $author = e($post->author?->name ?? '');

            return <<<XML
        <item>
            <title>{$postTitle}</title>
            <link>{$link}</link>
            <description>{$excerpt}</description>
            <pubDate>{$pubDate}</pubDate>
            <guid isPermaLink="true">{$link}</guid>
            {$this->authorTag($author)}
        </item>
XML;
        })->implode("\n");

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{$title}</title>
        <link>{$siteUrl}</link>
        <description>Latest blog posts from {$title}</description>
        <language>{$locale}</language>
        <lastBuildDate>{$now}</lastBuildDate>
        <atom:link href="{$feedUrl}" rel="self" type="application/rss+xml"/>
{$items}
    </channel>
</rss>
XML;
    }

    private function authorTag(string $author): string
    {
        if ($author === '' || $author === '0') {
            return '';
        }

        return sprintf('<author>%s</author>', $author);
    }
}
