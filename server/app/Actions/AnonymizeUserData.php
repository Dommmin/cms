<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CookieConsent;
use App\Models\User;
use Illuminate\Support\Str;

class AnonymizeUserData
{
    public function handle(User $user): void
    {
        // 1. Revoke all tokens
        $user->tokens()->delete();

        // 2. Anonymize User PII
        $user->forceFill([
            'name' => 'Deleted User #'.$user->id,
            'email' => sprintf('deleted+%s@deleted.invalid', $user->id),
            'password' => bcrypt(Str::random(40)),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'remember_token' => null,
        ])->saveQuietly();

        // 3. Cascade: Customer + related data
        if ($customer = $user->customer) {
            $customer->addresses()->delete();

            $customer->cart?->items()->delete();
            $customer->cart?->delete();

            $customer->wishlists->each(fn ($w) => $w->items()->delete());
            $customer->wishlists()->delete();

            if ($customer->newsletterSubscriber) {
                $customer->newsletterSubscriber->update([
                    'subscribed' => false,
                    'unsubscribed_at' => now(),
                ]);
            }

            $customer->delete(); // soft delete
        }

        // 4. Remove cookie consents (not financial data)
        CookieConsent::query()->where('user_id', $user->id)->delete();

        // 5. Soft-delete the User
        // Orders, ProductReviews, AffiliateCode are retained (financial/legal obligation)
        $user->delete();
    }
}
