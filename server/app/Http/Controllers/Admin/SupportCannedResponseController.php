<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSupportCannedResponseRequest;
use App\Http\Requests\Admin\UpdateSupportCannedResponseRequest;
use App\Models\SupportCannedResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class SupportCannedResponseController extends Controller
{
    public function index(): Response
    {
        $cannedResponses = SupportCannedResponse::query()
            ->orderBy('title')
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/support/canned-responses/index', [
            'canned_responses' => $cannedResponses,
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/support/canned-responses/create');
    }

    public function store(StoreSupportCannedResponseRequest $request): RedirectResponse
    {
        SupportCannedResponse::create($request->validated());

        return redirect()->route('admin.support.canned-responses.index')
            ->with('success', 'Odpowiedź zapisana.');
    }

    public function edit(SupportCannedResponse $cannedResponse): Response
    {
        return inertia('admin/support/canned-responses/edit', [
            'canned_response' => $cannedResponse,
        ]);
    }

    public function update(UpdateSupportCannedResponseRequest $request, SupportCannedResponse $cannedResponse): RedirectResponse
    {
        $cannedResponse->update($request->validated());

        return redirect()->route('admin.support.canned-responses.index')
            ->with('success', 'Odpowiedź zaktualizowana.');
    }

    public function destroy(SupportCannedResponse $cannedResponse): RedirectResponse
    {
        $cannedResponse->delete();

        return redirect()->route('admin.support.canned-responses.index')
            ->with('success', 'Odpowiedź usunięta.');
    }
}
