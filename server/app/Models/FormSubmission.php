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
 * @property int $form_id
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property string|null $ip
 * @property string|null $user_agent
 * @property string|null $referrer
 * @property string|null $page_url
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Form $form
 *
 * @method static Builder<static>|FormSubmission newModelQuery()
 * @method static Builder<static>|FormSubmission newQuery()
 * @method static Builder<static>|FormSubmission query()
 * @method static Builder<static>|FormSubmission whereCreatedAt($value)
 * @method static Builder<static>|FormSubmission whereFormId($value)
 * @method static Builder<static>|FormSubmission whereId($value)
 * @method static Builder<static>|FormSubmission whereIp($value)
 * @method static Builder<static>|FormSubmission wherePageUrl($value)
 * @method static Builder<static>|FormSubmission wherePayload($value)
 * @method static Builder<static>|FormSubmission whereReferrer($value)
 * @method static Builder<static>|FormSubmission whereStatus($value)
 * @method static Builder<static>|FormSubmission whereUpdatedAt($value)
 * @method static Builder<static>|FormSubmission whereUserAgent($value)
 *
 * @mixin Model
 */
#[Fillable([
    'form_id', 'payload', 'status', 'ip', 'user_agent', 'referrer', 'page_url',
])]
#[Table(name: 'form_submissions')]
class FormSubmission extends Model
{
    use HasFactory;

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
