<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreBlogVoteRequest;
use App\Http\Resources\Api\V1\BlogPostResource;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogPostView;
use App\Models\BlogPostVote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());
        $sort = $request->query('sort', '-created_at');

        $posts = BlogPost::query()->published()
            ->with(['author:id,name', 'category:id,name,slug'])
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->when($request->category, fn ($q, $slug) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $slug)
            ))
            ->when($request->featured, fn ($q) => $q->featured())
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search): void {
                $q->where('title', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('excerpt', 'like', sprintf('%%%s%%', $search));
            }))
            ->when($sort === 'popular', fn ($q) => $q->orderBy('views_count', 'desc'))
            ->when($sort === 'top_rated', fn ($q) => $q->orderByRaw(
                '(SELECT COUNT(*) FROM blog_post_votes WHERE blog_post_votes.blog_post_id = blog_posts.id AND vote = "up")
                - (SELECT COUNT(*) FROM blog_post_votes WHERE blog_post_votes.blog_post_id = blog_posts.id AND vote = "down") DESC'
            ))
            ->when(! in_array($sort, ['popular', 'top_rated'], true), fn ($q) => $q->latest('published_at'))
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return $this->ok(BlogPostResource::collection($posts)->response()->getData(true));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());

        $post = BlogPost::query()->published()
            ->where('slug', $slug)
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->with(['author:id,name', 'category:id,name,slug', 'votes'])
            ->firstOrFail();

        return $this->ok(new BlogPostResource($post));
    }

    public function vote(StoreBlogVoteRequest $request, string $slug): JsonResponse
    {
        $data = $request->validated();

        $post = BlogPost::query()->published()->where('slug', $slug)->firstOrFail();
        $userId = $request->user()->id;
        $vote = $data['vote'];

        $existing = BlogPostVote::query()
            ->where('blog_post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            if ($existing->vote === $vote) {
                $existing->delete();
                $userVote = null;
            } else {
                $existing->update(['vote' => $vote]);
                $userVote = $vote;
            }
        } else {
            BlogPostVote::query()->create([
                'blog_post_id' => $post->id,
                'user_id' => $userId,
                'vote' => $vote,
            ]);
            $userVote = $vote;
        }

        $post->loadCount([
            'votes as votes_up_count' => fn ($q) => $q->where('vote', 'up'),
            'votes as votes_down_count' => fn ($q) => $q->where('vote', 'down'),
        ]);

        return $this->ok([
            'votes_up' => $post->votes_up_count,
            'votes_down' => $post->votes_down_count,
            'user_vote' => $userVote,
        ]);
    }

    public function recordView(Request $request, string $slug): JsonResponse
    {
        $post = BlogPost::query()->published()->where('slug', $slug)->firstOrFail();

        $ipHash = hash('sha256', ($request->ip() ?? '').($request->header('User-Agent') ?? ''));
        $cutoff = now()->subHours(24);

        $alreadyViewed = BlogPostView::query()
            ->where('blog_post_id', $post->id)
            ->where('ip_hash', $ipHash)
            ->where('viewed_at', '>=', $cutoff)
            ->exists();

        if (! $alreadyViewed) {
            // Use upsert to handle race conditions
            BlogPostView::query()->upsert(
                [['blog_post_id' => $post->id, 'ip_hash' => $ipHash, 'viewed_at' => now()]],
                ['blog_post_id', 'ip_hash'],
                ['viewed_at']
            );
            $post->increment('views_count');
        }

        return $this->ok(['views_count' => $post->fresh()?->views_count ?? $post->views_count]);
    }

    public function byCategory(Request $request, string $slug): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());

        $category = BlogCategory::query()->active()->where('slug', $slug)->firstOrFail();

        $posts = BlogPost::query()->published()
            ->where('blog_category_id', $category->id)
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->with(['author:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->paginate(15)
            ->withQueryString();

        return $this->ok(BlogPostResource::collection($posts)->response()->getData(true));
    }
}
