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
            ->when($this->request->search, function ($query, $search) {
                $query->where('email', 'like', "%{$search}%")
                    ->orWhereHas('form', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($this->request->form_id, function ($query, $formId) {
                $query->where('form_id', $formId);
            })
            ->when($this->request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();
    }
}
