<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HomepageSectionTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    use HasFactory;

    /**
     * @deprecated Use Page + PageSection instead. Homepage is a normal Page.
     */
    protected $table = 'homepage_sections';

    protected $fillable = [
        'type', 'configuration', 'is_active', 'position',
    ];

    protected $casts = [
        'type' => HomepageSectionTypeEnum::class,
        'configuration' => 'array',
        'is_active' => 'boolean',
    ];
}
