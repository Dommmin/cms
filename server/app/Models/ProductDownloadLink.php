<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $events_count
 *
 * @method static Builder<static>|ProductDownloadLink newModelQuery()
 * @method static Builder<static>|ProductDownloadLink newQuery()
 * @method static Builder<static>|ProductDownloadLink query()
 * @method static Builder<static>|ProductDownloadLink whereCreatedAt($value)
 * @method static Builder<static>|ProductDownloadLink whereDownloadCount($value)
 * @method static Builder<static>|ProductDownloadLink whereExpiresAt($value)
 * @method static Builder<static>|ProductDownloadLink whereId($value)
 * @method static Builder<static>|ProductDownloadLink whereMaxDownloads($value)
 * @method static Builder<static>|ProductDownloadLink whereOrderItemId($value)
 * @method static Builder<static>|ProductDownloadLink whereProductVariantId($value)
 * @method static Builder<static>|ProductDownloadLink whereToken($value)
 * @method static Builder<static>|ProductDownloadLink whereUpdatedAt($value)
 *
 * @mixin Model
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

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'max_downloads' => 'integer',
            'download_count' => 'integer',
        ];
    }
}
