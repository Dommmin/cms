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
 * @property int|null $user_id
 * @property int|null $processed_by_user_id
 * @property string $type
 * @property string $status
 * @property string|null $email
 * @property array<string, mixed>|null $payload
 * @property string|null $resolution_note
 * @property CarbonImmutable $requested_at
 * @property CarbonImmutable|null $resolved_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|PrivacyRequest newModelQuery()
 * @method static Builder<static>|PrivacyRequest newQuery()
 * @method static Builder<static>|PrivacyRequest query()
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'processed_by_user_id',
    'type',
    'status',
    'email',
    'payload',
    'resolution_note',
    'requested_at',
    'resolved_at',
])]
#[Table(name: 'privacy_requests')]
class PrivacyRequest extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'requested_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
}
