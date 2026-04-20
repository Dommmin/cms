<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\OrderStatusEnum;
use App\Exports\CustomersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\User;
use App\Queries\Admin\CustomerIndexQuery;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customerQuery = new CustomerIndexQuery($request);
        $customers = $customerQuery->execute();

        return inertia('admin/ecommerce/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'customers-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new CustomersExport($request), $filename);
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['addresses', 'orders' => fn ($q) => $q->latest()->limit(10)->with('payment')]);

        $delivered = fn () => $customer->orders()->where('status', OrderStatusEnum::DELIVERED->value);

        $activityLog = Activity::query()
            ->where('subject_type', Customer::class)
            ->where('subject_id', $customer->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(/** @phpstan-ignore argument.type */ fn (Activity $a): array => [
                'id' => $a->id,
                'description' => $a->description,
                'log_name' => $a->log_name,
                'changes' => $a->changes,
                'causer' => $a->causer_type ? ['name' => $a->causer instanceof Model ? $a->causer->getAttribute('name') : 'System'] : null,
                'created_at' => $a->created_at?->toISOString(),
            ]);

        return inertia('admin/ecommerce/customers/show', [
            'customer' => array_merge($customer->toArray(), [
                'total_orders' => $customer->orders()->count(),
                'total_spent' => (int) $delivered()->sum('total'),
                'ltv_30_days' => (int) $delivered()->where('created_at', '>=', now()->subDays(30))->sum('total'),
                'ltv_90_days' => (int) $delivered()->where('created_at', '>=', now()->subDays(90))->sum('total'),
                'avg_order_value' => (int) ($delivered()->avg('total') ?? 0),
                'last_order_at' => $customer->orders()->latest()->value('created_at'),
            ]),
            'activityLog' => $activityLog,
        ]);
    }

    public function updateTags(Request $request, Customer $customer): RedirectResponse
    {
        $request->validate([
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $customer->update(['tags' => $request->input('tags', [])]);

        return back()->with('success', 'Tags updated');
    }

    public function edit(Customer $customer): Response
    {
        $customer->load('addresses');

        return inertia('admin/ecommerce/customers/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        $customer->update($data);

        return back()->with('success', 'Klient został zaktualizowany');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        if ($customer->orders()->exists()) {
            return back()->with('error', 'Nie można usunąć klienta z historią zamówień');
        }

        $customer->delete();

        return back()->with('success', 'Klient został usunięty');
    }

    public function impersonate(Customer $customer): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        abort_unless($user->can('customers.impersonate'), 403, 'Unauthorized to impersonate customers');

        $customerUser = $customer->user;

        if (! $customerUser) {
            return back()->with('error', 'Customer has no associated user account');
        }

        session()->put('impersonator_id', $user->id);
        session()->put('impersonating_customer', true);

        activity('customer')
            ->causedBy($user)
            ->performedOn($customer)
            ->log('impersonated');

        Auth::login($customerUser);

        return to_route('account.index')
            ->with('success', 'You are now impersonating '.$customer->name);
    }

    public function stopImpersonating(): RedirectResponse
    {
        $impersonatorId = session()->pull('impersonator_id');
        session()->forget('impersonating_customer');

        if ($impersonatorId) {
            $admin = User::query()->find($impersonatorId);
            Auth::login($admin);
        }

        return to_route('admin.ecommerce.customers.index')
            ->with('success', 'Stopped impersonating');
    }
}
