<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CurrencyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $symbol
 * @property int $decimal_places
 * @property bool $is_active
 * @property bool $is_base
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ExchangeRate> $exchangeRates
 * @property-read int|null $exchange_rates_count
 *
 * @method static CurrencyFactory factory($count = null, $state = [])
 * @method static Builder<static>|Currency newModelQuery()
 * @method static Builder<static>|Currency newQuery()
 * @method static Builder<static>|Currency query()
 * @method static Builder<static>|Currency whereCode($value)
 * @method static Builder<static>|Currency whereCreatedAt($value)
 * @method static Builder<static>|Currency whereDecimalPlaces($value)
 * @method static Builder<static>|Currency whereId($value)
 * @method static Builder<static>|Currency whereIsActive($value)
 * @method static Builder<static>|Currency whereIsBase($value)
 * @method static Builder<static>|Currency whereName($value)
 * @method static Builder<static>|Currency whereSymbol($value)
 * @method static Builder<static>|Currency whereUpdatedAt($value)
 *
 * @mixin Model
 */
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

    /**
     * @return HasMany<ExchangeRate, $this>
     */
    /**
     * @return HasMany<ExchangeRate, $this>
     */
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
