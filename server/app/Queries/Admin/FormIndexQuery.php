<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final readonly class FormIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return Form::query()
            ->withCount('submissions')
            ->when($this->request->search, function ($query) {
                $query->where('name', 'like', '%'.$this->request->search.'%')
                    ->orWhere('slug', 'like', '%'.$this->request->search.'%');
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($this->request->per_page ?? 10)
            ->withQueryString();
    }
}
