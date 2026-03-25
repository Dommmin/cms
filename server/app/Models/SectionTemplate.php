<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionTemplate extends Model
{
    use HasFactory;

    protected $table = 'section_templates';

    protected $fillable = [
        'name', 'section_type', 'variant', 'preset_data', 'thumbnail', 'is_global', 'category',
    ];

    protected $casts = [
        'preset_data' => 'array',
        'is_global' => 'boolean',
    ];

    /**
     * Get templates for a specific section type
     *
     * @return Collection<int, SectionTemplate>
     */
    public static function forSectionType(string $sectionType)
    {
        return self::query()->where('section_type', $sectionType)
            ->where(function ($query): void {
                $query->where('is_global', true)
                    ->orWhereNull('is_global');
            })
            ->orderBy('name')
            ->get();
    }
}
