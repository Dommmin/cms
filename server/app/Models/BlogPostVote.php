<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $blog_post_id
 * @property int $user_id
 * @property string $vote
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read BlogPost $post
 * @property-read User|null $user
 *
 * @method static Builder<static>|BlogPostVote newModelQuery()
 * @method static Builder<static>|BlogPostVote newQuery()
 * @method static Builder<static>|BlogPostVote query()
 * @method static Builder<static>|BlogPostVote whereBlogPostId($value)
 * @method static Builder<static>|BlogPostVote whereCreatedAt($value)
 * @method static Builder<static>|BlogPostVote whereId($value)
 * @method static Builder<static>|BlogPostVote whereUpdatedAt($value)
 * @method static Builder<static>|BlogPostVote whereUserId($value)
 * @method static Builder<static>|BlogPostVote whereVote($value)
 *
 * @mixin Model
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
