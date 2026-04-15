<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code', 'name', 'symbol', 'decimal_places', 'is_active', 'is_base',
])]
#[Table(name: 'currencies')]
class Currency extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'is_base' => 'boolean',
    ];

    public static function base(): self
    {
        return self::query()->where('is_base', true)->first()
            ?? self::query()->first()
            ?? new self([
                'code' => 'PLN',
                'name' => 'Polish Zloty',
                'symbol' => 'zl',
                'decimal_places' => 2,
                'is_active' => true,
                'is_base' => true,
            ]);
    }

    public function exchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRate::class);
    }

    public function latestRate(): ?ExchangeRate
    {
        return $this->exchangeRates()->latest('fetched_at')->first();
    }

    /** Formatuje grosze → wyświetlanie: 1999 → "19,99 zł" */
    public function format(int $amountInCents): string
    {
        $divisor = 10 ** $this->decimal_places;
        $amount = $amountInCents / $divisor;

        $formatted = number_format(
            $amount,
            $this->decimal_places,
            ',',
            ' '
        );

        return match ($this->code) {
            'USD' => '$'.str_replace(',', '.', $formatted),
            'EUR' => $formatted.' €',
            default => $formatted.' '.$this->symbol,
        };
    }
}
