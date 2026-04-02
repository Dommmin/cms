<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreBlogCommentRequest;
use App\Http\Resources\Api\V1\BlogCommentResource;
use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Notifications\BlogCommentReplyNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class BlogCommentController extends ApiController
{
    public function index(string $slug): AnonymousResourceCollection
    {
        $post = BlogPost::query()->published()->where('slug', $slug)->firstOrFail();

        $comments = $post->comments()
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return BlogCommentResource::collection($comments);
    }

    public function store(StoreBlogCommentRequest $request, string $slug): JsonResponse
    {
        $post = BlogPost::query()->published()->where('slug', $slug)->firstOrFail();

        $data = $request->validated();
        $parentId = $data['parent_id'] ?? null;

        if ($parentId !== null) {
            $parent = BlogComment::query()->findOrFail($parentId);

            // Only one level deep
            if ($parent->parent_id !== null) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Cannot reply to a reply.'],
                ]);
            }

            if ($parent->blog_post_id !== $post->id) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Parent comment does not belong to this post.'],
                ]);
            }
        }

        $comment = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'body' => $data['body'],
            'is_approved' => true,
        ]);

        $comment->load('user');

        // Notify parent comment author (if replying and not replying to self)
        if ($parentId !== null) {
            $parent = BlogComment::query()->with('user')->find($parentId);
            if ($parent && $parent->user_id !== $request->user()->id) {
                $parent->user->notify(new BlogCommentReplyNotification($comment, $post));
            }
        }

        return $this->created(new BlogCommentResource($comment));
    }
}
