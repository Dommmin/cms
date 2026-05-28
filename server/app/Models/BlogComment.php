<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $blog_post_id
 * @property int $user_id
 * @property int|null $parent_id
 * @property string $body
 * @property bool $is_approved
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read BlogComment|null $parent
 * @property-read \App\Models\BlogPost $post
 * @property-read \Illuminate\Database\Eloquent\Collection<int, BlogComment> $replies
 * @property-read int|null $replies_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereBlogPostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereIsApproved($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlogComment whereUserId($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'blog_post_id',
    'user_id',
    'parent_id',
    'body',
    'is_approved',
])]
class BlogComment extends Model
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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /** @return HasMany<BlogComment, $this> */
    public function replies(): HasMany
    {
        /** @var HasMany<BlogComment, $this> $relation */
        $relation = $this->hasMany(self::class, 'parent_id')
            ->where('is_approved', true)
            ->with('user');

        return $relation;
    }

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
        ];
    }
}
