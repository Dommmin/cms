<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'session_id',
    'event_name',
    'product_id',
    'product_variant_id',
    'url',
    'referrer',
    'metadata',
    'created_at',
])]
#[WithoutTimestamps]
final class AnalyticsEvent extends Model
{
    use HasFactory;
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    protected static function booted(): void
    {
        self::creating(function (AnalyticsEvent $event): void {
            $event->created_at ??= now();
        });
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
