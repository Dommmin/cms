<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\SupportConversationStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSupportMessageRequest;
use App\Models\SupportCannedResponse;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use App\Queries\Admin\SupportConversationIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SupportConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = new SupportConversationIndexQuery($request)->execute();

        $agents = User::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $openCount = SupportConversation::query()
            ->where('status', SupportConversationStatusEnum::OPEN)
            ->count();

        return inertia('admin/support/index', [
            'conversations' => $conversations,
            'filters' => $request->only(['search', 'status', 'assigned_to']),
            'agents' => $agents,
            'open_count' => $openCount,
            'statuses' => array_map(
                fn (SupportConversationStatusEnum $s): array => ['value' => $s->value, 'label' => $s->getLabel(), 'color' => $s->getColor()],
                SupportConversationStatusEnum::cases()
            ),
        ]);
    }

    public function show(SupportConversation $conversation): Response
    {
        $conversation->load(['messages', 'assignedTo:id,name', 'customer.orders' => function ($q): void {
            $q->orderByDesc('created_at')->limit(5)->select(['id', 'customer_id', 'reference_number', 'status', 'total']);
        }]);

        $this->markCustomerMessagesRead($conversation);

        $agents = User::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $cannedResponses = SupportCannedResponse::query()
            ->orderBy('title')
            ->get(['id', 'title', 'shortcut', 'body']);

        return inertia('admin/support/show', [
            'conversation' => $conversation,
            'agents' => $agents,
            'canned_responses' => $cannedResponses,
            'statuses' => array_map(
                fn (SupportConversationStatusEnum $s): array => ['value' => $s->value, 'label' => $s->getLabel(), 'color' => $s->getColor()],
                SupportConversationStatusEnum::cases()
            ),
        ]);
    }

    public function reply(StoreSupportMessageRequest $request, SupportConversation $conversation): RedirectResponse
    {
        $data = $request->validated();

        SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'agent',
            'sender_name' => $request->user()->name,
            'body' => $data['body'],
            'is_internal' => $data['is_internal'] ?? false,
        ]);

        if (! ($data['is_internal'] ?? false)) {
            $conversation->update([
                'last_reply_at' => now(),
                'status' => SupportConversationStatusEnum::PENDING,
            ]);
        }

        return back()->with('success', 'Odpowiedź wysłana.');
    }

    public function assign(Request $request, SupportConversation $conversation): RedirectResponse
    {
        $request->validate(['assigned_to' => ['nullable', 'exists:users,id']]);

        $conversation->update(['assigned_to' => $request->assigned_to]);

        return back()->with('success', 'Konwersacja przypisana.');
    }

    public function changeStatus(Request $request, SupportConversation $conversation): RedirectResponse
    {
        $request->validate(['status' => ['required', 'in:open,pending,resolved,closed']]);

        $conversation->update(['status' => $request->status]);

        return back()->with('success', 'Status zmieniony.');
    }

    public function destroy(SupportConversation $conversation): RedirectResponse
    {
        $conversation->delete();

        return to_route('admin.support.index')->with('success', 'Konwersacja usunięta.');
    }

    private function markCustomerMessagesRead(SupportConversation $conversation): void
    {
        $conversation->messages()
            ->where('sender_type', 'customer')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
