<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $content
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentEntry whereUpdatedAt($value)
 * @mixin \Eloquent
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
