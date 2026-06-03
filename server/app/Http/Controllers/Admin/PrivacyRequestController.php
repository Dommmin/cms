<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrivacyRequest;
use App\Models\User;
use App\Queries\Admin\PrivacyRequestIndexQuery;
use Illuminate\Http\Request;
use Inertia\Response;

class PrivacyRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $privacyRequestQuery = new PrivacyRequestIndexQuery($request);

        return inertia('admin/privacy-requests/index', [
            'privacyRequests' => $privacyRequestQuery->execute(),
            'stats' => $privacyRequestQuery->getStats(),
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function show(PrivacyRequest $privacyRequest): Response
    {
        $privacyRequest->load(['user:id,name,email', 'processedByUser:id,name,email']);

        return inertia('admin/privacy-requests/show', [
            'privacyRequest' => [
                'id' => $privacyRequest->id,
                'type' => $privacyRequest->type,
                'status' => $privacyRequest->status,
                'email' => $privacyRequest->email,
                'payload' => $privacyRequest->payload,
                'resolution_note' => $privacyRequest->resolution_note,
                'requested_at' => $privacyRequest->requested_at->toIso8601String(),
                'resolved_at' => $privacyRequest->resolved_at?->toIso8601String(),
                'user' => $privacyRequest->user instanceof User ? [
                    'id' => $privacyRequest->user->id,
                    'name' => $privacyRequest->user->name,
                    'email' => $privacyRequest->user->email,
                ] : null,
                'processed_by_user' => $privacyRequest->processedByUser instanceof User ? [
                    'id' => $privacyRequest->processedByUser->id,
                    'name' => $privacyRequest->processedByUser->name,
                    'email' => $privacyRequest->processedByUser->email,
                ] : null,
            ],
        ]);
    }
}
