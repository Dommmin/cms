<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PageApprovalController extends Controller
{
    public function submitForReview(Page $page): RedirectResponse
    {
        $page->update([
            'approval_status' => 'in_review',
            'submitted_for_review_at' => now(),
        ]);

        return back()->with('success', 'Page submitted for review.');
    }

    public function approve(Page $page): RedirectResponse
    {
        $page->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'reviewer_id' => auth()->user()?->getKey(),
        ]);

        return back()->with('success', 'Page approved.');
    }

    public function reject(Request $request, Page $page): RedirectResponse
    {
        $request->validate(['note' => ['nullable', 'string', 'max:1000']]);

        $page->update([
            'approval_status' => 'draft',
            'review_note' => $request->input('note'),
        ]);

        return back()->with('success', 'Page rejected and returned to draft.');
    }
}
