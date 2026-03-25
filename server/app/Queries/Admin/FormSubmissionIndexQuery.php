<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\FormSubmission;
use Illuminate\Http\Request;

class FormSubmissionIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return FormSubmission::query()
            ->with('form')
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('email', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('form', function ($q) use ($search): void {
                        $q->where('name', 'like', sprintf('%%%s%%', $search));
                    });
            })
            ->when($this->request->form_id, function ($query, $formId): void {
                $query->where('form_id', $formId);
            })
            ->when($this->request->date_from, function ($query, $date): void {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date): void {
                $query->whereDate('created_at', '<=', $date);
            })->latest()
            ->paginate(25)
            ->withQueryString();
    }
}
