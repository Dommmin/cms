<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Theme model representing UI/themes configuration stored in the database.
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'tokens',
    'settings',
    'preview_image',
    'is_active',
])]
#[Table(name: 'themes')]
class Theme extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'tokens' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('theme');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'theme_id');
    }
}
