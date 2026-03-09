<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromQuery, ShouldAutoSize, ShouldQueue, WithHeadings, WithMapping
{
    public function __construct(private readonly Request $request) {}

    public function query(): \Illuminate\Database\Eloquent\Builder
    {
        return Product::query()
            ->with(['categories', 'brand', 'defaultVariant'])
            ->when($this->request->input('search'), function ($q, $s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            })
            ->when($this->request->input('is_active') !== null, fn ($q) => $q->where('is_active', $this->request->boolean('is_active')))
            ->orderByDesc('created_at');
    }

    /** @return string[] */
    public function headings(): array
    {
        return [
            'ID', 'Name', 'Slug', 'Brand', 'Categories', 'SKU',
            'Price', 'Stock', 'Is Active', 'Is Featured', 'Created At',
        ];
    }

    /** @param Product $row */
    public function map(mixed $row): array
    {
        return [
            $row->id,
            $row->name,
            $row->slug,
            $row->brand?->name,
            $row->categories->pluck('name')->join(', '),
            $row->defaultVariant?->sku,
            number_format(($row->defaultVariant?->price ?? 0) / 100, 2),
            $row->defaultVariant?->stock_quantity ?? 0,
            $row->is_active ? 'Yes' : 'No',
            $row->is_featured ? 'Yes' : 'No',
            $row->created_at?->toDateTimeString(),
        ];
    }
}
