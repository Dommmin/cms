<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'currency_id', 'rate', 'source', 'fetched_at',
])]
#[Table(name: 'exchange_rates')]
class ExchangeRate extends Model
{
    use HasFactory;

    protected $casts = [
        'rate' => 'float',
        'fetched_at' => 'datetime',
    ];

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
