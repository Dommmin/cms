<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    use HasFactory;

    protected $table = 'forms';

    protected $fillable = [
        'name', 'slug', 'description', 'settings', 'notify_emails', 'is_active',
        'notification_email', 'success_message', 'allow_multiple',
    ];

    protected $casts = [
        'settings' => 'array',
        'notify_emails' => 'array',
        'is_active' => 'boolean',
        'allow_multiple' => 'boolean',
    ];

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('position');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class)->latest();
    }
}
