<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    /** @return BelongsToMany<BlogPost, $this> */
    public function blogPosts(): BelongsToMany
    {
        return $this->belongsToMany(BlogPost::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Tag $tag): void {
            $tag->slug ??= Str::slug($tag->name);
        });

        static::updating(function (Tag $tag): void {
            $tag->slug = Str::slug($tag->name);
        });
    }
}
