<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HomepageSectionTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property HomepageSectionTypeEnum $type
 *
 * @method static Builder<static>|HomepageSection newModelQuery()
 * @method static Builder<static>|HomepageSection newQuery()
 * @method static Builder<static>|HomepageSection query()
 *
 * @mixin Model
 */
#[Fillable([
    'type', 'configuration', 'is_active', 'position',
])]
#[Table(name: 'homepage_sections')]
class HomepageSection extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => HomepageSectionTypeEnum::class,
            'configuration' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
