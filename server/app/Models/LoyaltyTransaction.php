<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $customer_id
 * @property string $type
 * @property int $points
 * @property string $description
 * @property string $source_type
 * @property int $source_id
 * @property int $balance_after
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Model $source
 *
 * @method static Builder<static>|LoyaltyTransaction newModelQuery()
 * @method static Builder<static>|LoyaltyTransaction newQuery()
 * @method static Builder<static>|LoyaltyTransaction query()
 * @method static Builder<static>|LoyaltyTransaction whereBalanceAfter($value)
 * @method static Builder<static>|LoyaltyTransaction whereCreatedAt($value)
 * @method static Builder<static>|LoyaltyTransaction whereCustomerId($value)
 * @method static Builder<static>|LoyaltyTransaction whereDescription($value)
 * @method static Builder<static>|LoyaltyTransaction whereId($value)
 * @method static Builder<static>|LoyaltyTransaction wherePoints($value)
 * @method static Builder<static>|LoyaltyTransaction whereSourceId($value)
 * @method static Builder<static>|LoyaltyTransaction whereSourceType($value)
 * @method static Builder<static>|LoyaltyTransaction whereType($value)
 * @method static Builder<static>|LoyaltyTransaction whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'customer_id',
    'type',
    'points',
    'description',
    'source_type',
    'source_id',
    'balance_after',
])]
class LoyaltyTransaction extends Model
{
    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'balance_after' => 'integer',
        ];
    }
}
