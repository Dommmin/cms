<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CustomerSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'rules',
        'customers_count',
        'is_active',
    ];

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
