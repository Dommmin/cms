<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AnalyticsEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'event_name',
        'product_id',
        'product_variant_id',
        'url',
        'referrer',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (AnalyticsEvent $event): void {
            $event->created_at = $event->created_at ?? now();
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
