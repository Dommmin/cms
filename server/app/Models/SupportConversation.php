<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SupportChannelEnum;
use App\Enums\SupportConversationStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $last_reply_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $assignedTo
 * @property-read \App\Models\Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupportMessage> $messages
 * @property-read int|null $messages_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupportMessage> $unreadMessages
 * @property-read int|null $unread_messages_count
 * @method static \Database\Factories\SupportConversationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereAssignedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereLastReplyAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportConversation whereUpdatedAt($value)
 * @mixin \Eloquent
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
