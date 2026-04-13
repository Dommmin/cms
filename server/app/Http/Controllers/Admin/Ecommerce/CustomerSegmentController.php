<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreCustomerSegmentRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateCustomerSegmentRequest;
use App\Models\CustomerSegment;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class CustomerSegmentController extends Controller
{
    public function index(): Response
    {
        $segments = CustomerSegment::query()->latest()
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/ecommerce/customer-segments/index', [
            'segments' => $segments,
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/customer-segments/create');
    }

    public function store(StoreCustomerSegmentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= false;
        $data['customers_count'] = 0;

        CustomerSegment::query()->create($data);

        return to_route('admin.ecommerce.customer-segments.index')
            ->with('success', 'Segment klientów został utworzony');
    }

    public function edit(CustomerSegment $customerSegment): Response
    {
        return inertia('admin/ecommerce/customer-segments/edit', [
            'segment' => $customerSegment,
        ]);
    }

    public function update(UpdateCustomerSegmentRequest $request, CustomerSegment $customerSegment): RedirectResponse
    {
        $customerSegment->update($request->validated());

        return back()->with('success', 'Segment klientów został zaktualizowany');
    }

    public function destroy(CustomerSegment $customerSegment): RedirectResponse
    {
        $customerSegment->delete();

        return back()->with('success', 'Segment klientów został usunięty');
    }

    public function sync(CustomerSegment $customerSegment): RedirectResponse
    {
        if ($customerSegment->type !== 'dynamic') {
            return back()->with('error', 'Synchronizacja dostępna tylko dla segmentów dynamicznych');
        }

        $customerSegment->syncCustomers();

        return back()->with('success', 'Segment został zsynchronizowany');
    }
}
