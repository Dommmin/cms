<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\SegmentEvaluationService;
use Carbon\CarbonImmutable;
use Database\Factories\CustomerSegmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $type
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $rules
 * @property-read int|null $customers_count
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Customer> $customers
 *
 * @method static CustomerSegmentFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomerSegment newModelQuery()
 * @method static Builder<static>|CustomerSegment newQuery()
 * @method static Builder<static>|CustomerSegment query()
 * @method static Builder<static>|CustomerSegment whereCreatedAt($value)
 * @method static Builder<static>|CustomerSegment whereCustomersCount($value)
 * @method static Builder<static>|CustomerSegment whereDescription($value)
 * @method static Builder<static>|CustomerSegment whereId($value)
 * @method static Builder<static>|CustomerSegment whereIsActive($value)
 * @method static Builder<static>|CustomerSegment whereName($value)
 * @method static Builder<static>|CustomerSegment whereRules($value)
 * @method static Builder<static>|CustomerSegment whereType($value)
 * @method static Builder<static>|CustomerSegment whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'description',
    'type',
    'rules',
    'customers_count',
    'is_active',
])]
class CustomerSegment extends Model
{
    use HasFactory;

    protected $casts = [
        'rules' => 'array',
        'customers_count' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Customers in this segment (for manual segments).
     */
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'customer_segment_customer')
            ->withPivot('added_at')
            ->withTimestamps();
    }

    /**
     * Evaluate if a customer matches this segment's rules.
     */
    public function matchesCustomer(Customer $customer): bool
    {
        if ($this->type === 'manual') {
            return $this->customers()->where('customer_id', $customer->id)->exists();
        }

        return resolve(SegmentEvaluationService::class)->matches($customer, $this->rules ?? []);
    }

    /**
     * Sync customers for dynamic segments.
     */
    public function syncCustomers(): void
    {
        if ($this->type !== 'dynamic') {
            return;
        }

        $customerIds = resolve(SegmentEvaluationService::class)
            ->getMatchingCustomerIds($this->rules ?? []);

        // Update pivot table for manual segment relationships
        $this->customers()->sync($customerIds);
        $this->update(['customers_count' => count($customerIds)]);
    }
}
