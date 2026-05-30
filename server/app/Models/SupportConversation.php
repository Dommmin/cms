<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SupportChannelEnum;
use App\Enums\SupportConversationStatusEnum;
use Carbon\CarbonImmutable;
use Database\Factories\SupportConversationFactory;
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
 * @property string $token
 * @property int|null $customer_id
 * @property int|null $assigned_to
 * @property string|null $email
 * @property string|null $name
 * @property string $subject
 * @property SupportConversationStatusEnum $status
 * @property SupportChannelEnum $channel
 * @property CarbonImmutable|null $last_reply_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $assignedTo
 * @property-read Customer|null $customer
 * @property-read Collection<int, SupportMessage> $messages
 * @property-read int|null $messages_count
 * @property-read Collection<int, SupportMessage> $unreadMessages
 * @property-read int|null $unread_messages_count
 *
 * @method static SupportConversationFactory factory($count = null, $state = [])
 * @method static Builder<static>|SupportConversation newModelQuery()
 * @method static Builder<static>|SupportConversation newQuery()
 * @method static Builder<static>|SupportConversation query()
 * @method static Builder<static>|SupportConversation whereAssignedTo($value)
 * @method static Builder<static>|SupportConversation whereChannel($value)
 * @method static Builder<static>|SupportConversation whereCreatedAt($value)
 * @method static Builder<static>|SupportConversation whereCustomerId($value)
 * @method static Builder<static>|SupportConversation whereEmail($value)
 * @method static Builder<static>|SupportConversation whereId($value)
 * @method static Builder<static>|SupportConversation whereLastReplyAt($value)
 * @method static Builder<static>|SupportConversation whereName($value)
 * @method static Builder<static>|SupportConversation whereStatus($value)
 * @method static Builder<static>|SupportConversation whereSubject($value)
 * @method static Builder<static>|SupportConversation whereToken($value)
 * @method static Builder<static>|SupportConversation whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'token', 'customer_id', 'assigned_to', 'email', 'name',
    'subject', 'status', 'channel', 'last_reply_at',
])]
#[Table(name: 'support_conversations')]
class SupportConversation extends Model
{
    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class, 'conversation_id')->oldest();
    }

    public function unreadMessages(): HasMany
    {
        return $this->hasMany(SupportMessage::class, 'conversation_id')
            ->where('sender_type', 'customer')
            ->whereNull('read_at');
    }

    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            if (empty($model->token)) {
                $model->token = (string) Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'status' => SupportConversationStatusEnum::class,
            'channel' => SupportChannelEnum::class,
            'last_reply_at' => 'datetime',
        ];
    }
}
