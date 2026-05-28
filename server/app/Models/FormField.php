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
 * @property string $name
 * @property string $label
 * @property string $type
 * @property array<array-key, mixed>|null $options
 * @property array<array-key, mixed>|null $validation
 * @property array<array-key, mixed>|null $settings
 * @property int $position
 * @property bool $is_required
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Form $form
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereFormId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereOptions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FormField whereValidation($value)
 * @mixin \Eloquent
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
