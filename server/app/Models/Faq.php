<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\FaqFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $question
 * @property string $answer
 * @property string|null $category
 * @property int $position
 * @property bool $is_active
 * @property int $views_count
 * @property int $helpful_count
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|Faq active()
 * @method static Builder<static>|Faq byCategory(?string $category)
 * @method static FaqFactory factory($count = null, $state = [])
 * @method static Builder<static>|Faq newModelQuery()
 * @method static Builder<static>|Faq newQuery()
 * @method static Builder<static>|Faq query()
 * @method static Builder<static>|Faq whereAnswer($value)
 * @method static Builder<static>|Faq whereCategory($value)
 * @method static Builder<static>|Faq whereCreatedAt($value)
 * @method static Builder<static>|Faq whereHelpfulCount($value)
 * @method static Builder<static>|Faq whereId($value)
 * @method static Builder<static>|Faq whereIsActive($value)
 * @method static Builder<static>|Faq wherePosition($value)
 * @method static Builder<static>|Faq whereQuestion($value)
 * @method static Builder<static>|Faq whereUpdatedAt($value)
 * @method static Builder<static>|Faq whereViewsCount($value)
 *
 * @mixin Model
 */
#[Fillable([
    'question',
    'answer',
    'category',
    'position',
    'is_active',
    'views_count',
    'helpful_count',
])]
#[Table(name: 'faqs')]
class Faq extends Model
{
    use HasFactory;

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

    /**
     * Scope a query to only include active FAQs.
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by category.
     */
    #[Scope]
    protected function byCategory(Builder $query, ?string $category): Builder
    {
        if ($category === null || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
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
