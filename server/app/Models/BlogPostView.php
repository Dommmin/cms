<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogPostView extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'blog_post_id',
        'ip_hash',
        'viewed_at',
    ];

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
