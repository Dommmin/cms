<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Date;

#[Fillable([
    'owner_type',
    'owner_id',
    'namespace',
    'key',
    'type',
    'value',
    'description',
])]
class Metafield extends Model
{
    use HasFactory;

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function getCastedValue(): mixed
    {
        return match ($this->type) {
            'integer' => (int) $this->value,
            'float' => (float) $this->value,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode((string) $this->value, true),
            'date', 'datetime' => $this->value ? Date::parse($this->value) : null,
            default => $this->value,
        };
    }
}
