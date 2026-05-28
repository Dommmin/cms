<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $blog_post_id
 * @property string $ip_hash
 * @property \Carbon\CarbonImmutable $viewed_at
 * @property-read \App\Models\BlogPost $post
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView whereBlogPostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView whereIpHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogPostView whereViewedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'blog_post_id',
    'ip_hash',
    'viewed_at',
])]
#[WithoutTimestamps]
class BlogPostView extends Model
{
    use HasFactory;

    public function post(): BelongsTo
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }

    protected function casts(): array
    {
        return [
            'viewed_at' => 'datetime',
        ];
    }
}
