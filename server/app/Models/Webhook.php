<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Webhook extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'url',
        'secret',
        'events',
        'is_active',
        'description',
        'last_triggered_at',
        'failure_count',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    protected static function booted(): void
    {
        self::creating(static function (Webhook $webhook): void {
            $webhook->secret ??= bin2hex(random_bytes(32));
        });
    }

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'is_active' => 'boolean',
            'failure_count' => 'integer',
            'last_triggered_at' => 'datetime',
        ];
    }
}
