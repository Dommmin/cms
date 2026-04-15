<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $order_item_id
 * @property int $product_variant_id
 * @property string $token
 * @property Carbon|null $expires_at
 * @property int $download_count
 * @property int|null $max_downloads
 * @property-read OrderItem|null $orderItem
 * @property-read ProductVariant $variant
 * @property-read Collection<int, ProductDownloadEvent> $events
 */
#[Fillable([
    'order_item_id',
    'product_variant_id',
    'token',
    'expires_at',
    'max_downloads',
    'download_count',
])]
#[Table(name: 'product_download_links')]
class ProductDownloadLink extends Model
{
    use HasFactory;

    protected $casts = [
        'expires_at' => 'datetime',
        'max_downloads' => 'integer',
        'download_count' => 'integer',
    ];

    public static function generateToken(): string
    {
        return Str::random(64);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ProductDownloadEvent::class, 'product_download_link_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isDownloadLimitReached(): bool
    {
        return $this->max_downloads !== null && $this->download_count >= $this->max_downloads;
    }

    public function canDownload(): bool
    {
        return ! $this->isExpired() && ! $this->isDownloadLimitReached();
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }
}
