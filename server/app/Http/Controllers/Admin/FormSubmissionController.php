<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Queries\Admin\FormSubmissionIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class FormSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $submissionQuery = new FormSubmissionIndexQuery($request);
        $submissions = $submissionQuery->execute();

        return inertia('admin/form-submissions/index', [
            'submissions' => $submissions,
            'filters' => $request->only(['search', 'form_id', 'date_from', 'date_to']),
        ]);
    }

    public function show(Form $form, FormSubmission $submission): Response
    {
        $submission->load('form');

        return inertia('admin/forms/submission-show', [
            'form' => $form,
            'submission' => $submission,
        ]);
    }

    public function destroy(Form $form, FormSubmission $submission): RedirectResponse
    {
        $submission->delete();

        return back()->with('success', 'Submission deleted');
    }
}
