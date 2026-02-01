<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\PageLayout;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class StaticPage extends Model
{
    protected $table = 'static_pages';

    protected $fillable = [
        'parent_id', 'title', 'slug', 'content', 'excerpt', 'layout',
        'is_published', 'show_in_footer', 'show_in_header', 'position',
        'seo_title', 'seo_description', 'seo_canonical',
    ];

    protected $casts = [
        'layout'         => PageLayout::class,
        'is_published'   => 'boolean',
        'show_in_footer' => 'boolean',
        'show_in_header' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('position');
    }
}

