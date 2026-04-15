<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
