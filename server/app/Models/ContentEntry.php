<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $content
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|ContentEntry newModelQuery()
 * @method static Builder<static>|ContentEntry newQuery()
 * @method static Builder<static>|ContentEntry query()
 * @method static Builder<static>|ContentEntry whereContent($value)
 * @method static Builder<static>|ContentEntry whereCreatedAt($value)
 * @method static Builder<static>|ContentEntry whereId($value)
 * @method static Builder<static>|ContentEntry whereIsActive($value)
 * @method static Builder<static>|ContentEntry whereName($value)
 * @method static Builder<static>|ContentEntry whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'content',
    'is_active',
])]
#[Table(name: 'content_entries')]
class ContentEntry extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
