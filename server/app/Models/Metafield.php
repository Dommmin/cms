<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Date;

/**
 * @property int $id
 * @property string $owner_type
 * @property int $owner_id
 * @property string $namespace
 * @property string $key
 * @property string $type
 * @property string|null $value
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read Model|\Eloquent $owner
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereNamespace($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereOwnerType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Metafield whereValue($value)
 * @mixin \Eloquent
 */
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
