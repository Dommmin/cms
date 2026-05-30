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
 * @property string $name
 * @property string $label
 * @property string $type
 * @property array<array-key, mixed>|null $options
 * @property array<array-key, mixed>|null $validation
 * @property array<array-key, mixed>|null $settings
 * @property int $position
 * @property bool $is_required
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Form $form
 *
 * @method static Builder<static>|FormField newModelQuery()
 * @method static Builder<static>|FormField newQuery()
 * @method static Builder<static>|FormField query()
 * @method static Builder<static>|FormField whereCreatedAt($value)
 * @method static Builder<static>|FormField whereFormId($value)
 * @method static Builder<static>|FormField whereId($value)
 * @method static Builder<static>|FormField whereIsRequired($value)
 * @method static Builder<static>|FormField whereLabel($value)
 * @method static Builder<static>|FormField whereName($value)
 * @method static Builder<static>|FormField whereOptions($value)
 * @method static Builder<static>|FormField wherePosition($value)
 * @method static Builder<static>|FormField whereSettings($value)
 * @method static Builder<static>|FormField whereType($value)
 * @method static Builder<static>|FormField whereUpdatedAt($value)
 * @method static Builder<static>|FormField whereValidation($value)
 *
 * @mixin Model
 */
#[Fillable([
    'form_id', 'name', 'label', 'type', 'options', 'validation', 'settings',
    'position', 'is_required',
])]
#[Table(name: 'form_fields')]
class FormField extends Model
{
    use HasFactory;

    protected $casts = [
        'options' => 'array',
        'validation' => 'array',
        'settings' => 'array',
        'is_required' => 'boolean',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }
}
