<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'locale_code',
        'group',
        'key',
        'value',
    ];

    public function locale(): BelongsTo
    {
        return $this->belongsTo(Locale::class, 'locale_code', 'code');
    }

    public function scopeForLocale(\Illuminate\Database\Eloquent\Builder $query, string $localeCode): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('locale_code', $localeCode);
    }

    public function scopeInGroup(\Illuminate\Database\Eloquent\Builder $query, string $group): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('group', $group);
    }
}
