<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportMessage extends Model
{
    use HasFactory;

    protected $table = 'support_messages';

    protected $fillable = [
        'conversation_id', 'sender_type', 'sender_name',
        'body', 'is_internal', 'read_at',
    ];

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
