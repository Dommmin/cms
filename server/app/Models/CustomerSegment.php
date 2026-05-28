<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\SegmentEvaluationService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Customer> $customers
 * @method static \Database\Factories\CustomerSegmentFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereCustomersCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereRules($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerSegment whereUpdatedAt($value)
 * @mixin \Eloquent
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
