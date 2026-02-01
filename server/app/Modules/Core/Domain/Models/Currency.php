<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Currency extends Model
{
    protected $table = 'currencies';

    protected $fillable = [
        'code', 'name', 'symbol', 'decimal_places', 'is_active', 'is_base',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_base'   => 'boolean',
    ];

    public function exchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRate::class);
    }

    public function latestRate(): ?ExchangeRate
    {
        return $this->exchangeRates()->orderByDesc('fetched_at')->first();
    }

    public static function base(): self
    {
        return self::where('is_base', true)->firstOrFail();
    }

    /** Formatuje grosze → wyświetlanie: 1999 → "19,99 zł" */
    public function format(int $amountInCents): string
    {
        $divisor  = pow(10, $this->decimal_places);
        $amount   = $amountInCents / $divisor;

        $formatted = number_format(
            $amount,
            $this->decimal_places,
            ',',
            ' '
        );

        return match($this->code) {
            'USD'   => '$' . str_replace(',', '.', $formatted),
            'EUR'   => $formatted . ' €',
            default => $formatted . ' ' . $this->symbol,
        };
    }
}

