<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $currency_id
 * @property float $rate
 * @property string $source
 * @property CarbonImmutable $fetched_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Currency $currency
 *
 * @method static Builder<static>|ExchangeRate newModelQuery()
 * @method static Builder<static>|ExchangeRate newQuery()
 * @method static Builder<static>|ExchangeRate query()
 * @method static Builder<static>|ExchangeRate whereCreatedAt($value)
 * @method static Builder<static>|ExchangeRate whereCurrencyId($value)
 * @method static Builder<static>|ExchangeRate whereFetchedAt($value)
 * @method static Builder<static>|ExchangeRate whereId($value)
 * @method static Builder<static>|ExchangeRate whereRate($value)
 * @method static Builder<static>|ExchangeRate whereSource($value)
 * @method static Builder<static>|ExchangeRate whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'currency_id', 'rate', 'source', 'fetched_at',
])]
#[Table(name: 'exchange_rates')]
class ExchangeRate extends Model
{
    use HasFactory;

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    protected function casts(): array
    {
        return [
            'rate' => 'float',
            'fetched_at' => 'datetime',
        ];
    }
}
