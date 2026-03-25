<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AddSupportMessageRequest;
use App\Http\Requests\Api\V1\StartSupportConversationRequest;
use App\Http\Resources\Api\V1\SupportConversationResource;
use App\Http\Resources\Api\V1\SupportMessageResource;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;

class SupportController extends Controller
{
    public function store(StartSupportConversationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $request->user();
        $customer = $user?->customer;

        $email = $customer?->email ?? $data['email'] ?? null;
        $name = $customer ? ($customer->first_name.' '.$customer->last_name) : ($data['name'] ?? null);

        $conversation = SupportConversation::query()->create([
            'customer_id' => $customer?->id,
            'email' => $email,
            'name' => $name,
            'subject' => $data['subject'],
            'status' => 'open',
            'channel' => $data['channel'] ?? 'widget',
            'last_reply_at' => now(),
        ]);

        SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'customer',
            'sender_name' => $name ?? $email ?? 'Gość',
            'body' => $data['body'],
            'is_internal' => false,
        ]);

        $conversation->load('messages');

        return response()->json(new SupportConversationResource($conversation), 201);
    }

    public function show(string $token): JsonResponse
    {
        $conversation = SupportConversation::query()
            ->where('token', $token)
            ->with(['messages' => fn ($q) => $q->where('is_internal', false)])
            ->firstOrFail();

        $this->markAgentMessagesRead($conversation);

        return response()->json(new SupportConversationResource($conversation));
    }

    public function addMessage(AddSupportMessageRequest $request, string $token): JsonResponse
    {
        $conversation = SupportConversation::query()
            ->where('token', $token)
            ->whereNotIn('status', ['closed', 'resolved'])
            ->firstOrFail();

        $user = $request->user();
        $customer = $user?->customer;
        $name = $customer ? ($customer->first_name.' '.$customer->last_name) : ($conversation->name ?? $conversation->email ?? 'Gość');

        $message = SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'customer',
            'sender_name' => $name,
            'body' => $request->validated('body'),
            'is_internal' => false,
        ]);

        $conversation->update(['last_reply_at' => now(), 'status' => 'open']);

        return response()->json(new SupportMessageResource($message), 201);
    }

    private function markAgentMessagesRead(SupportConversation $conversation): void
    {
        $conversation->messages()
            ->where('sender_type', 'agent')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
