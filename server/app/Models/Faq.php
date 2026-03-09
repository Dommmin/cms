<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;

    protected $table = 'faqs';

    protected $fillable = [
        'question',
        'answer',
        'category',
        'position',
        'is_active',
        'views_count',
        'helpful_count',
    ];

    /**
     * Scope a query to only include active FAQs.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory(Builder $query, ?string $category): Builder
    {
        if ($category === null || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }

    /**
     * Increment views count.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Increment helpful count.
     */
    public function incrementHelpful(): void
    {
        $this->increment('helpful_count');
    }

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_active' => 'boolean',
            'views_count' => 'integer',
            'helpful_count' => 'integer',
        ];
    }
}
