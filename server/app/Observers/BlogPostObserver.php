<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\BlogPost;
use App\Enums\BlogPostStatusEnum;
use App\Services\WebhookService;

class BlogPostObserver
{
    public function created(BlogPost $post): void
    {
        if ($post->status === BlogPostStatusEnum::Published) {
            $this->dispatchBlogWebhook($post, 'blog_post.published');
        }
    }

    public function updated(BlogPost $post): void
    {
        if ($post->wasChanged('status')) {
            $wasPublished = $post->getOriginal('status') === BlogPostStatusEnum::Published;
            $isPublished = $post->status === BlogPostStatusEnum::Published;

            if ($isPublished && ! $wasPublished) {
                $this->dispatchBlogWebhook($post, 'blog_post.published');
            } elseif (! $isPublished && $wasPublished) {
                $this->dispatchBlogWebhook($post, 'blog_post.unpublished');
            }
        }
    }

    private function dispatchBlogWebhook(BlogPost $post, string $event): void
    {
        $frontendUrl = mb_rtrim((string) config('app.frontend_url', ''), '/');
        $path = '/blog/'.$post->slug;

        $payload = [
            'type' => 'blog_post',
            'id' => $post->id,
            'title' => $post->getTranslations('title'),
            'slug' => $post->slug,
            'slug_translations' => $post->getTranslations('slug'),
            'path' => $path,
            'url' => $frontendUrl !== '' ? $frontendUrl.$path : $path,
            'status' => $post->status instanceof BlogPostStatusEnum ? $post->status->value : (string) $post->status,
            'published_at' => $post->published_at?->toIso8601String(),
            'updated_at' => $post->updated_at?->toIso8601String(),
        ];

        resolve(WebhookService::class)->dispatch($event, $payload);
    }
}
