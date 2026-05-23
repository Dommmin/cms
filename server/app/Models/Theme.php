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
 *
 * @property array<string, mixed>|null $tokens
 * @property array<string, mixed>|null $typography
 * @property array<string, mixed>|null $spacing
 * @property array<string, mixed>|null $buttons
 * @property array<string, mixed>|null $containers
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'tokens',
    'typography',
    'spacing',
    'buttons',
    'containers',
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
        'typography' => 'array',
        'spacing' => 'array',
        'buttons' => 'array',
        'containers' => 'array',
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
