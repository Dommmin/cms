<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $conversation_id
 * @property string $sender_type
 * @property string $sender_name
 * @property string $body
 * @property bool $is_internal
 * @property \Carbon\CarbonImmutable|null $read_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SupportConversation $conversation
 * @method static \Database\Factories\SupportMessageFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereIsInternal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereSenderName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereSenderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportMessage whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'conversation_id', 'sender_type', 'sender_name',
    'body', 'is_internal', 'read_at',
])]
#[Table(name: 'support_messages')]
class SupportMessage extends Model
{
    use HasFactory;

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(SupportConversation::class, 'conversation_id');
    }

    public function isFromCustomer(): bool
    {
        return $this->sender_type === 'customer';
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'read_at' => 'datetime',
        ];
    }
}
