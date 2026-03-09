<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\OrderStatusEnum;
use App\Exports\CustomersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\UpdateCustomerRequest;
use App\Models\Customer;
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

        return redirect()->back()->with('success', 'Klient został zaktualizowany');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        if ($customer->orders()->exists()) {
            return redirect()->back()->with('error', 'Nie można usunąć klienta z historią zamówień');
        }

        $customer->delete();

        return redirect()->back()->with('success', 'Klient został usunięty');
    }
}
