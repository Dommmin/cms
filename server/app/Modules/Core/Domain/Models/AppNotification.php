<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AppNotification extends Model
{
    protected $table = 'app_notifications';

    protected $fillable = [
        'customer_id', 'type', 'channel', 'status',
        'related_model', 'related_model_id', 'metadata',
        'sent_at', 'failed_at', 'error_message',
    ];

    protected $casts = [
        'type'     => NotificationType::class,
        'channel'  => NotificationChannel::class,
        'status'   => NotificationStatus::class,
        'metadata' => 'array',
        'sent_at'  => 'datetime',
        'failed_at'=> 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}

