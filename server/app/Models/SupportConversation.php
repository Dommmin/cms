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
