<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Model $owner
 *
 * @method static Builder<static>|Metafield newModelQuery()
 * @method static Builder<static>|Metafield newQuery()
 * @method static Builder<static>|Metafield query()
 * @method static Builder<static>|Metafield whereCreatedAt($value)
 * @method static Builder<static>|Metafield whereDescription($value)
 * @method static Builder<static>|Metafield whereId($value)
 * @method static Builder<static>|Metafield whereKey($value)
 * @method static Builder<static>|Metafield whereNamespace($value)
 * @method static Builder<static>|Metafield whereOwnerId($value)
 * @method static Builder<static>|Metafield whereOwnerType($value)
 * @method static Builder<static>|Metafield whereType($value)
 * @method static Builder<static>|Metafield whereUpdatedAt($value)
 * @method static Builder<static>|Metafield whereValue($value)
 *
 * @mixin Model
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
