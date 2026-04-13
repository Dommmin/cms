<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEmailTemplateRequest;
use App\Models\EmailTemplate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = EmailTemplate::query()
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('admin/email-templates/index', [
            'templates' => $templates,
        ]);
    }

    public function edit(EmailTemplate $emailTemplate): Response
    {
        return Inertia::render('admin/email-templates/edit', [
            'template' => $emailTemplate,
        ]);
    }

    public function update(UpdateEmailTemplateRequest $request, EmailTemplate $emailTemplate): RedirectResponse
    {
        $emailTemplate->update($request->validated());

        return back()->with('success', 'Template updated successfully.');
    }
}
