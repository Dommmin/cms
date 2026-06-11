<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $localesExist = DB::table('locales')->whereIn('code', ['en', 'pl'])->count() === 2;
        if (! $localesExist) {
            // Locales do not exist yet (e.g., during migrate:fresh before seeders run).
            // Skip inserting here; the TranslationSeeder will populate these values during seeding.
            return;
        }

        $translations = [
            // Polish (pl)
            ['locale_code' => 'pl', 'group' => 'product', 'key' => 'notify_when_available', 'value' => 'Przypomnij jak będzie dostępny'],
            ['locale_code' => 'pl', 'group' => 'product', 'key' => 'notify_email_placeholder', 'value' => 'Wpisz swój adres e-mail'],
            ['locale_code' => 'pl', 'group' => 'product', 'key' => 'notify_submit', 'value' => 'Powiadom mnie'],
            ['locale_code' => 'pl', 'group' => 'product', 'key' => 'notify_success', 'value' => 'Zostaniesz powiadomiony, gdy produkt pojawi się na stanie!'],
            ['locale_code' => 'pl', 'group' => 'product', 'key' => 'notify_already_subscribed', 'value' => 'Już zapisałeś się na powiadomienia o tym produkcie.'],
            ['locale_code' => 'pl', 'group' => 'cart', 'key' => 'add_stock_error', 'value' => 'Produkt jest obecnie niedostępny w wybranej ilości.'],
            ['locale_code' => 'pl', 'group' => 'cart', 'key' => 'add_error_generic', 'value' => 'Nie udało się dodać produktu do koszyka. Spróbuj ponownie.'],
            ['locale_code' => 'pl', 'group' => 'cart', 'key' => 'update_error_generic', 'value' => 'Nie udało się zaktualizować ilości w koszyku.'],

            // English (en)
            ['locale_code' => 'en', 'group' => 'product', 'key' => 'notify_when_available', 'value' => 'Notify when available'],
            ['locale_code' => 'en', 'group' => 'product', 'key' => 'notify_email_placeholder', 'value' => 'Enter your email address'],
            ['locale_code' => 'en', 'group' => 'product', 'key' => 'notify_submit', 'value' => 'Notify me'],
            ['locale_code' => 'en', 'group' => 'product', 'key' => 'notify_success', 'value' => 'You will be notified when this product is back in stock!'],
            ['locale_code' => 'en', 'group' => 'product', 'key' => 'notify_already_subscribed', 'value' => 'You are already subscribed to notifications for this product.'],
            ['locale_code' => 'en', 'group' => 'cart', 'key' => 'add_stock_error', 'value' => 'Product is currently unavailable in the requested quantity.'],
            ['locale_code' => 'en', 'group' => 'cart', 'key' => 'add_error_generic', 'value' => 'Could not add product to cart. Please try again.'],
            ['locale_code' => 'en', 'group' => 'cart', 'key' => 'update_error_generic', 'value' => 'Could not update cart quantity.'],
        ];

        foreach ($translations as $translation) {
            DB::table('translations')->updateOrInsert(
                [
                    'locale_code' => $translation['locale_code'],
                    'group' => $translation['group'],
                    'key' => $translation['key'],
                ],
                [
                    'value' => $translation['value'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('translations')
            ->where('group', 'product')
            ->whereIn('key', ['notify_when_available', 'notify_email_placeholder', 'notify_submit', 'notify_success', 'notify_already_subscribed'])
            ->delete();

        DB::table('translations')
            ->where('group', 'cart')
            ->whereIn('key', ['add_stock_error', 'add_error_generic', 'update_error_generic'])
            ->delete();
    }
};
