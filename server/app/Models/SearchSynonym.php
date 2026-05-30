<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $term
 * @property array<array-key, mixed> $synonyms
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|SearchSynonym newModelQuery()
 * @method static Builder<static>|SearchSynonym newQuery()
 * @method static Builder<static>|SearchSynonym query()
 * @method static Builder<static>|SearchSynonym whereCreatedAt($value)
 * @method static Builder<static>|SearchSynonym whereId($value)
 * @method static Builder<static>|SearchSynonym whereIsActive($value)
 * @method static Builder<static>|SearchSynonym whereSynonyms($value)
 * @method static Builder<static>|SearchSynonym whereTerm($value)
 * @method static Builder<static>|SearchSynonym whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'term',
    'synonyms',
    'is_active',
])]
class SearchSynonym extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'synonyms' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
