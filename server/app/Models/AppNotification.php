<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\NotificationChannelEnum;
use App\Enums\NotificationStatusEnum;
use App\Enums\NotificationTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    use HasFactory;

    protected $table = 'app_notifications';

    protected $fillable = [
        'customer_id', 'type', 'channel', 'status',
        'related_model', 'related_model_id', 'metadata',
        'sent_at', 'failed_at', 'error_message',
    ];

    protected $casts = [
        'type' => NotificationTypeEnum::class,
        'channel' => NotificationChannelEnum::class,
        'status' => NotificationStatusEnum::class,
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
