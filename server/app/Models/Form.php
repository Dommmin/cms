<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, FormField> $fields
 * @property-read int|null $fields_count
 * @property-read Collection<int, FormSubmission> $submissions
 * @property-read int|null $submissions_count
 *
 * @method static Builder<static>|Form newModelQuery()
 * @method static Builder<static>|Form newQuery()
 * @method static Builder<static>|Form query()
 * @method static Builder<static>|Form whereAllowMultiple($value)
 * @method static Builder<static>|Form whereCreatedAt($value)
 * @method static Builder<static>|Form whereDescription($value)
 * @method static Builder<static>|Form whereId($value)
 * @method static Builder<static>|Form whereIsActive($value)
 * @method static Builder<static>|Form whereName($value)
 * @method static Builder<static>|Form whereNotificationEmail($value)
 * @method static Builder<static>|Form whereNotifyEmails($value)
 * @method static Builder<static>|Form whereSettings($value)
 * @method static Builder<static>|Form whereSlug($value)
 * @method static Builder<static>|Form whereSuccessMessage($value)
 * @method static Builder<static>|Form whereUpdatedAt($value)
 *
 * @mixin Model
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
