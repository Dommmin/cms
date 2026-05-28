<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $term
 * @property array<array-key, mixed> $synonyms
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereSynonyms($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereTerm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchSynonym whereUpdatedAt($value)
 * @mixin \Eloquent
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
