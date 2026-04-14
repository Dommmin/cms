<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\AnonymizeUserData;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\DestroyAccountRequest;
use App\Http\Requests\Api\V1\RestrictProcessingRequest;
use App\Http\Requests\Api\V1\UpdatePasswordRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Order;
use App\Models\Setting;
use App\Notifications\AccountDeletedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->ok(new UserResource($request->user()->load('customer.addresses')));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update([
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
        ]);

        if ($user->customer) {
            $user->customer->update([
                'first_name' => $data['first_name'] ?? $user->customer->first_name,
                'last_name' => $data['last_name'] ?? $user->customer->last_name,
                'phone' => $data['phone'] ?? $user->customer->phone,
                'company_name' => $data['company_name'] ?? $user->customer->company_name,
            ]);
        }

        return $this->ok(new UserResource($user->fresh()->load('customer')));
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return $this->ok(['message' => 'Password updated successfully']);
    }

    /**
     * GDPR Art. 17 — Right to erasure ("right to be forgotten").
     * Soft-deletes the account and revokes all tokens.
     */
    public function destroy(DestroyAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        // GDPR Art. 19 — Send confirmation email before anonymization
        $user->notify(new AccountDeletedNotification);

        (new AnonymizeUserData)->handle($user);

        return $this->ok(['message' => 'Account deleted successfully']);
    }

    /**
     * GDPR Art. 15 — Right of access / Subject Access Request (SAR).
     * Returns all personal data held about the authenticated user.
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user()->load(['customer.addresses']);
        $customer = $user->customer;

        $orders = $customer
            ? Order::query()
                ->where('customer_id', $customer->id)
                ->with(['items.variant', 'shipment'])
                ->get()
                ->map(fn ($o): array => [
                    'reference_number' => $o->reference_number,
                    'status' => $o->status,
                    'total' => $o->total,
                    'created_at' => $o->created_at,
                    'items' => $o->items->map(fn ($i): array => [
                        'product_name' => $i->product_name,
                        'quantity' => $i->quantity,
                        'unit_price' => $i->unit_price,
                    ]),
                ])
            : [];

        $reviews = $customer
            ? $customer->reviews()->with('product:id,name')->get()->map(fn ($r): array => [
                'product_name' => $r->product?->name,
                'rating' => $r->rating,
                'body' => $r->body,
                'created_at' => $r->created_at,
            ])
            : [];

        $newsletter = $customer?->newsletterSubscriber ? [
            'subscribed' => $customer->newsletterSubscriber->subscribed,
            'subscribed_at' => $customer->newsletterSubscriber->subscribed_at,
        ] : null;

        return $this->ok([
            'exported_at' => now()->toIso8601String(),
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'processing_restricted_at' => $user->processing_restricted_at,
            ],
            'profile' => $customer ? [
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone' => $customer->phone,
                'company_name' => $customer->company_name,
                'addresses' => $customer->addresses->map(fn ($a): array => [
                    'street' => $a->street,
                    'street2' => $a->street2,
                    'city' => $a->city,
                    'postal_code' => $a->postal_code,
                    'country_code' => $a->country_code,
                ]),
            ] : null,
            'orders' => $orders,
            'reviews' => $reviews,
            'newsletter' => $newsletter,
        ]);
    }

    public function publicSettings(): JsonResponse
    {
        $settings = Setting::query()->where('is_public', true)->get();

        $grouped = $settings->groupBy('group')->map(fn ($group) => $group->mapWithKeys(fn ($setting): array => [
            $setting->key => $setting->value,
        ]));

        return $this->ok([
            'settings' => $grouped,
            'modules' => config('modules'),
        ]);
    }

    /**
     * GDPR Art. 18 — Set processing restriction.
     */
    public function restrictProcessing(RestrictProcessingRequest $request): JsonResponse
    {
        $request->user()->update(['processing_restricted_at' => now()]);

        return $this->ok(['message' => 'Data processing has been restricted.']);
    }

    /**
     * GDPR Art. 18 — Lift processing restriction.
     */
    public function liftProcessingRestriction(RestrictProcessingRequest $request): JsonResponse
    {
        $request->user()->update(['processing_restricted_at' => null]);

        return $this->noContent();
    }
}
