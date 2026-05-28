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
 * @property int $form_id
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property string|null $ip
 * @property string|null $user_agent
 * @property string|null $referrer
 * @property string|null $page_url
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Form $form
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereFormId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereIp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission wherePageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission wherePayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereReferrer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormSubmission whereUserAgent($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'form_id', 'payload', 'status', 'ip', 'user_agent', 'referrer', 'page_url',
])]
#[Table(name: 'form_submissions')]
class FormSubmission extends Model
{
    use HasFactory;

    protected $casts = [
        'payload' => 'array',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }
}
