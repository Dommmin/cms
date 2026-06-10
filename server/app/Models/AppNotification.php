<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\NotificationChannelEnum;
use App\Enums\NotificationStatusEnum;
use App\Enums\NotificationTypeEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $customer_id
 * @property NotificationTypeEnum $type
 * @property NotificationChannelEnum $channel
 * @property NotificationStatusEnum $status
 * @property string|null $related_model
 * @property int|null $related_model_id
 * @property array<string, mixed>|null $metadata
 * @property string|null $error_message
 * @property Carbon|null $sent_at
 * @property Carbon|null $failed_at
 * @property-read Customer|null $customer
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|AppNotification newModelQuery()
 * @method static Builder<static>|AppNotification newQuery()
 * @method static Builder<static>|AppNotification query()
 * @method static Builder<static>|AppNotification whereChannel($value)
 * @method static Builder<static>|AppNotification whereCreatedAt($value)
 * @method static Builder<static>|AppNotification whereCustomerId($value)
 * @method static Builder<static>|AppNotification whereErrorMessage($value)
 * @method static Builder<static>|AppNotification whereFailedAt($value)
 * @method static Builder<static>|AppNotification whereId($value)
 * @method static Builder<static>|AppNotification whereMetadata($value)
 * @method static Builder<static>|AppNotification whereRelatedModel($value)
 * @method static Builder<static>|AppNotification whereRelatedModelId($value)
 * @method static Builder<static>|AppNotification whereSentAt($value)
 * @method static Builder<static>|AppNotification whereStatus($value)
 * @method static Builder<static>|AppNotification whereType($value)
 * @method static Builder<static>|AppNotification whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'customer_id', 'type', 'channel', 'status',
    'related_model', 'related_model_id', 'metadata',
    'sent_at', 'failed_at', 'error_message',
])]
#[Table(name: 'app_notifications')]
class AppNotification extends Model
{
    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    protected function casts(): array
    {
        return [
            'type' => NotificationTypeEnum::class,
            'channel' => NotificationChannelEnum::class,
            'status' => NotificationStatusEnum::class,
            'metadata' => 'array',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }
}
