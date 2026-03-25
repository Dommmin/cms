<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\ReturnStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use App\Queries\Admin\ReturnRequestIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $returnQuery = new ReturnRequestIndexQuery($request);
        $returns = $returnQuery->execute();

        return inertia('admin/ecommerce/returns/index', [
            'returns' => $returns,
            'filters' => $request->only(['search', 'status', 'return_type']),
            'statuses' => array_map(fn (ReturnStatusEnum $s): array => ['value' => $s->value, 'label' => $s->label()], ReturnStatusEnum::cases()),
        ]);
    }

    public function show(ReturnRequest $return): Response
    {
        $return->load(['order.customer', 'items.productVariant.product', 'statusHistory']);

        return inertia('admin/ecommerce/returns/show', [
            'return' => $return,
        ]);
    }

    public function edit(ReturnRequest $return): Response
    {
        $return->load(['order', 'items']);

        return inertia('admin/ecommerce/returns/edit', [
            'return' => $return,
            'statuses' => array_map(fn (ReturnStatusEnum $s): array => ['value' => $s->value, 'label' => $s->label()], ReturnStatusEnum::cases()),
        ]);
    }

    public function update(UpdateReturnRequest $request, ReturnRequest $return): RedirectResponse
    {
        $data = $request->validated();

        $oldStatus = $return->status;
        $newStatus = ReturnStatusEnum::from($data['status']);

        if ($oldStatus !== $newStatus) {
            $return->changeStatus($newStatus, 'admin', $data['admin_notes'] ?? null);
        }

        $return->update([
            'admin_notes' => $data['admin_notes'] ?? $return->admin_notes,
            'refund_amount' => $data['refund_amount'] ?? $return->refund_amount,
        ]);

        return back()->with('success', 'Zwrot został zaktualizowany');
    }

    public function destroy(ReturnRequest $return): RedirectResponse
    {
        $return->delete();

        return to_route('admin.ecommerce.returns.index')
            ->with('success', 'Zwrot został usunięty');
    }

    public function approve(ReturnRequest $return): RedirectResponse
    {
        $return->changeStatus(ReturnStatusEnum::Approved, 'admin');

        return back()->with('success', 'Zwrot został zatwierdzony');
    }

    public function reject(ReturnRequest $return): RedirectResponse
    {
        $return->changeStatus(ReturnStatusEnum::Rejected, 'admin');

        return back()->with('success', 'Zwrot został odrzucony');
    }

    public function processRefund(ReturnRequest $return): RedirectResponse
    {
        // TODO: Implementacja zwrotu środków przez bramkę płatności
        $return->changeStatus(ReturnStatusEnum::Refunded, 'admin', 'Zwrot środków przetworzony');

        return back()->with('success', 'Zwrot środków został przetworzony');
    }
}
