<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property array<array-key, mixed>|null $settings
 * @property array<array-key, mixed>|null $notify_emails
 * @property string|null $notification_email
 * @property string|null $success_message
 * @property bool $allow_multiple
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FormField> $fields
 * @property-read int|null $fields_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FormSubmission> $submissions
 * @property-read int|null $submissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereAllowMultiple($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereNotificationEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereNotifyEmails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereSuccessMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Form whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name', 'slug', 'description', 'settings', 'notify_emails', 'is_active',
    'notification_email', 'success_message', 'allow_multiple',
])]
#[Table(name: 'forms')]
class Form extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'settings' => 'array',
        'notify_emails' => 'array',
        'is_active' => 'boolean',
        'allow_multiple' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('form');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('position');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class)->latest();
    }
}
