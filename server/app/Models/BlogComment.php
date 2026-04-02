<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'blog_post_id',
        'user_id',
        'parent_id',
        'body',
        'is_approved',
    ];

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
        return $this->hasMany(self::class, 'parent_id')
            ->where('is_approved', true)
            ->with('user');
    }

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
        ];
    }
}
