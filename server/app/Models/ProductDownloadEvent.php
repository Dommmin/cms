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
 * @property int $product_download_link_id
 * @property int|null $user_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductDownloadLink $link
 * @property-read User|null $user
 *
 * @method static Builder<static>|ProductDownloadEvent newModelQuery()
 * @method static Builder<static>|ProductDownloadEvent newQuery()
 * @method static Builder<static>|ProductDownloadEvent query()
 * @method static Builder<static>|ProductDownloadEvent whereCreatedAt($value)
 * @method static Builder<static>|ProductDownloadEvent whereId($value)
 * @method static Builder<static>|ProductDownloadEvent whereIpAddress($value)
 * @method static Builder<static>|ProductDownloadEvent whereProductDownloadLinkId($value)
 * @method static Builder<static>|ProductDownloadEvent whereUpdatedAt($value)
 * @method static Builder<static>|ProductDownloadEvent whereUserAgent($value)
 * @method static Builder<static>|ProductDownloadEvent whereUserId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_download_link_id',
    'user_id',
    'ip_address',
    'user_agent',
])]
#[Table(name: 'product_download_events')]
class ProductDownloadEvent extends Model
{
    use HasFactory;

    public function link(): BelongsTo
    {
        return $this->belongsTo(ProductDownloadLink::class, 'product_download_link_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
