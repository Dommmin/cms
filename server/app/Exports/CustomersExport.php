<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersExport implements FromQuery, ShouldAutoSize, ShouldQueue, WithHeadings, WithMapping
{
    public function __construct(private readonly Request $request) {}

    public function query(): Builder
    {
        return Customer::query()
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->when($this->request->input('search'), function ($q, $s): void {
                $q->where('first_name', 'like', sprintf('%%%s%%', $s))
                    ->orWhere('last_name', 'like', sprintf('%%%s%%', $s))
                    ->orWhere('email', 'like', sprintf('%%%s%%', $s));
            })->latest();
    }

    /** @return string[] */
    public function headings(): array
    {
        return [
            'ID', 'First Name', 'Last Name', 'Email', 'Phone',
            'Total Orders', 'Total Spent', 'Created At',
        ];
    }

    /** @param Customer $row */
    public function map(mixed $row): array
    {
        return [
            $row->id,
            $row->first_name,
            $row->last_name,
            $row->email,
            $row->phone,
            $row->orders_count,
            number_format(($row->orders_sum_total ?? 0) / 100, 2),
            $row->created_at?->toDateTimeString(),
        ];
    }
}
