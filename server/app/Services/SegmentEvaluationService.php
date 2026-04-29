<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SegmentEvaluationService
{
    /**
     * Apply a single rule to the query.
     *
     * @param  Builder<Customer>  $query
     * @param  array<string, mixed>  $rule
     */
    private const array ALLOWED_OPERATORS = ['=', '!=', '<', '>', '<=', '>='];

    /**
     * Check if a customer matches the given segment rules.
     *
     * @param  array<string, mixed>  $rules
     */
    public function matches(Customer $customer, array $rules): bool
    {
        if ($rules === []) {
            return false;
        }

        $query = Customer::query()->where('id', $customer->id);
        $this->applyRules($query, $rules);

        return $query->exists();
    }

    /**
     * Get all customer IDs matching the given rules.
     *
     * @param  array<string, mixed>  $rules
     * @return array<int>
     */
    public function getMatchingCustomerIds(array $rules): array
    {
        if ($rules === []) {
            return [];
        }

        $query = Customer::query();
        $this->applyRules($query, $rules);

        return $query->pluck('id')->toArray();
    }

    /**
     * Apply segment rules to the query builder.
     *
     * @param  Builder<Customer>  $query
     * @param  array<string, mixed>  $rules
     */
    protected function applyRules(Builder $query, array $rules): void
    {
        foreach ($rules as $rule) {
            $this->applyRule($query, $rule);
        }
    }

    protected function applyRule(Builder $query, array $rule): void
    {
        $field = $rule['field'] ?? null;
        $operator = $rule['operator'] ?? '=';
        $value = $rule['value'] ?? null;

        if (empty($field) || $value === null) {
            return;
        }

        if (! in_array($operator, self::ALLOWED_OPERATORS, true)) {
            return;
        }

        match ($field) {
            'total_spent' => $this->applyTotalSpentRule($query, $operator, $value),
            'order_count' => $this->applyOrderCountRule($query, $operator, $value),
            'average_order_value' => $this->applyAvgOrderValueRule($query, $operator, $value),
            'last_order_date' => $this->applyLastOrderDateRule($query, $operator, $value),
            'customer_age_days' => $this->applyCustomerAgeRule($query, $operator, $value),
            'has_tag' => $this->applyTagRule($query, $operator, $value),
            default => null,
        };
    }

    protected function applyTotalSpentRule(Builder $query, string $operator, mixed $value): void
    {
        $value = (float) $value;

        $query->whereHas('orders', function (Builder $q) use ($operator, $value): void {
            $q->whereIn('status', ['delivered', 'shipped'])
                ->select('customer_id', DB::raw('SUM(total) as total_spent'))
                ->groupBy('customer_id')
                ->having('total_spent', $operator, $value * 100); // Convert to cents
        });
    }

    protected function applyOrderCountRule(Builder $query, string $operator, mixed $value): void
    {
        $value = (int) $value;

        $query->withCount(['orders' => function (Builder $q): void {
            $q->whereIn('status', ['delivered', 'shipped']);
        }])
            ->having('orders_count', $operator, $value);
    }

    protected function applyAvgOrderValueRule(Builder $query, string $operator, mixed $value): void
    {
        $value = (float) $value;

        $query->whereHas('orders', function (Builder $q) use ($operator, $value): void {
            $q->whereIn('status', ['delivered', 'shipped'])
                ->select('customer_id', DB::raw('AVG(total) as avg_order_value'))
                ->groupBy('customer_id')
                ->having('avg_order_value', $operator, $value * 100); // Convert to cents
        });
    }

    protected function applyLastOrderDateRule(Builder $query, string $operator, mixed $value): void
    {
        $days = (int) $value;

        $query->whereHas('orders', function (Builder $q) use ($operator, $days): void {
            $q->whereIn('status', ['delivered', 'shipped'])
                ->select('customer_id', DB::raw('MAX(created_at) as last_order'))
                ->groupBy('customer_id')
                ->havingRaw('DATEDIFF(NOW(), last_order) '.$operator.' ?', [$days]);
        });
    }

    protected function applyCustomerAgeRule(Builder $query, string $operator, mixed $value): void
    {
        $days = (int) $value;

        $query->whereRaw('DATEDIFF(NOW(), created_at) '.$operator.' ?', [$days]);
    }

    protected function applyTagRule(Builder $query, string $operator, mixed $value): void
    {
        // Placeholder for future tag implementation
        // TODO: Implement when customer tags are added
    }
}
