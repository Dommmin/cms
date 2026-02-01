<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\HomepageSectionType;
use Illuminate\Database\Eloquent\Model;

final class HomepageSection extends Model
{
    protected $table = 'homepage_sections';

    protected $fillable = [
        'type', 'configuration', 'is_active', 'position',
    ];

    protected $casts = [
        'type'          => HomepageSectionType::class,
        'configuration' => 'array',
        'is_active'     => 'boolean',
    ];
}

