<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $table = 'exchange_rates';

    protected $fillable = [
        'currency_id', 'rate', 'source', 'fetched_at',
    ];

    protected $casts = [
        'rate' => 'float',
        'fetched_at' => 'datetime',
    ];

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
