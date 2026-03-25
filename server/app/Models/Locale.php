<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Locale extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'native_name',
        'flag_emoji',
        'currency_code',
        'is_default',
        'is_active',
    ];

    /**
     * @return Collection<Locale>
     */
    public static function getLocales(): Collection
    {
        return self::query()
            ->select(['code', 'name', 'native_name', 'flag_emoji', 'is_default'])
            ->active()
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();
    }

    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class, 'locale_code', 'code');
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function default(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
