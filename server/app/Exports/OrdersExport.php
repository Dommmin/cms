<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromQuery, ShouldAutoSize, ShouldQueue, WithHeadings, WithMapping
{
    public function __construct(private readonly Request $request) {}

    public function query(): \Illuminate\Database\Eloquent\Builder
    {
        return Order::query()
            ->with(['customer', 'payment', 'shipment.shippingMethod'])
            ->when($this->request->input('search'), function ($query, $search) {
                $query->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($q) => $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($this->request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($this->request->input('date_from'), fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($this->request->input('date_to'), fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderByDesc('created_at');
    }

    /** @return string[] */
    public function headings(): array
    {
        return [
            'Reference', 'Status', 'Customer Name', 'Customer Email',
            'Subtotal', 'Discount', 'Shipping', 'Total', 'Currency',
            'Payment Provider', 'Payment Status', 'Shipping Method',
            'Tracking Number', 'Created At',
        ];
    }

    /** @param Order $row */
    public function map(mixed $row): array
    {
        return [
            $row->reference_number,
            (string) $row->status,
            $row->customer?->first_name.' '.$row->customer?->last_name,
            $row->customer?->email,
            number_format($row->subtotal / 100, 2),
            number_format($row->discount_amount / 100, 2),
            number_format($row->shipping_cost / 100, 2),
            number_format($row->total / 100, 2),
            $row->currency_code,
            $row->payment?->provider,
            $row->payment?->status,
            $row->shipment?->shippingMethod?->name,
            $row->shipment?->tracking_number,
            $row->created_at?->toDateTimeString(),
        ];
    }
}
