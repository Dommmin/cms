<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchSynonym extends Model
{
    use HasFactory;

    protected $fillable = [
        'term',
        'synonyms',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'synonyms' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
