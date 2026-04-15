<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'rate', 'country_code', 'is_active', 'is_default',
])]
#[Table(name: 'tax_rates')]
class TaxRate extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public static function default(): ?self
    {
        return self::query()->where('is_default', true)->first();
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** Oblicza VAT z ceny brutto (grosze) */
    public function taxFromGross(int $grossPrice): int
    {
        return (int) round($grossPrice - ($grossPrice / (1 + $this->rate / 100)));
    }

    /** Oblicza cenę netto z brutto (grosze) */
    public function netFromGross(int $grossPrice): int
    {
        return (int) round($grossPrice / (1 + $this->rate / 100));
    }
}
