<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function edit(EmailTemplate $template): Response
    {
        return Inertia::render('admin/email-templates/edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, EmailTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        $template->update($validated);

        return back()->with('success', 'Template updated.');
    }
}
