<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HomepageSectionTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'type', 'configuration', 'is_active', 'position',
])]
#[Table(name: 'homepage_sections')]
class HomepageSection extends Model
{
    use HasFactory;

    protected $casts = [
        'type' => HomepageSectionTypeEnum::class,
        'configuration' => 'array',
        'is_active' => 'boolean',
    ];
}
