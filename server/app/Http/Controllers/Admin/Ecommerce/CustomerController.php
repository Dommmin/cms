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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
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
        $customer->load(['addresses', 'orders' => fn ($q) => $q->latest()->limit(10)]);

        $stats = [
            'total_orders' => $customer->orders()->count(),
            'total_spent' => $customer->orders()
                ->where('status', OrderStatusEnum::DELIVERED->value)
                ->sum('total'),
            'pending_orders' => $customer->orders()
                ->whereNotIn('status', [OrderStatusEnum::CANCELLED->value, OrderStatusEnum::DELIVERED->value])
                ->count(),
        ];

        return inertia('admin/ecommerce/customers/show', [
            'customer' => $customer,
            'stats' => $stats,
        ]);
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
        $user = auth()->user();

        abort_unless($user->can('customers.impersonate'), 403, 'Unauthorized to impersonate customers');

        $customerUser = $customer->user;

        if (! $customerUser) {
            return back()->with('error', 'Customer has no associated user account');
        }

        session()->put('impersonator_id', $user->id);
        session()->put('impersonating_customer', true);

        auth()->login($customerUser);

        return to_route('account.index')
            ->with('success', 'You are now impersonating '.$customer->name);
    }

    public function stopImpersonating(): RedirectResponse
    {
        $impersonatorId = session()->pull('impersonator_id');
        session()->forget('impersonating_customer');

        if ($impersonatorId) {
            $admin = User::query()->find($impersonatorId);
            auth()->login($admin);
        }

        return to_route('admin.ecommerce.customers.index')
            ->with('success', 'Stopped impersonating');
    }
}
