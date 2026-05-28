<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $blog_post_id
 * @property int $user_id
 * @property string $vote
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\BlogPost $post
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereBlogPostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostVote whereVote($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'blog_post_id',
    'user_id',
    'vote',
])]
class BlogPostVote extends Model
{
    use HasFactory;

    public function post(): BelongsTo
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'vote' => 'string',
        ];
    }
}
