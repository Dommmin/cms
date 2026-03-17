<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Translation;
use Illuminate\Database\Seeder;

class TranslationSeeder extends Seeder
{
    public function run(): void
    {
        $translations = [
            // ── nav ────────────────────────────────────────────────────────────
            ['group' => 'nav', 'key' => 'home', 'en' => 'Home', 'pl' => 'Strona główna'],
            ['group' => 'nav', 'key' => 'shop', 'en' => 'Shop', 'pl' => 'Sklep'],
            ['group' => 'nav', 'key' => 'blog', 'en' => 'Blog', 'pl' => 'Blog'],
            ['group' => 'nav', 'key' => 'faq', 'en' => 'FAQ', 'pl' => 'FAQ'],
            ['group' => 'nav', 'key' => 'cart', 'en' => 'Cart', 'pl' => 'Koszyk'],
            ['group' => 'nav', 'key' => 'login', 'en' => 'Login', 'pl' => 'Zaloguj się'],
            ['group' => 'nav', 'key' => 'logout', 'en' => 'Logout', 'pl' => 'Wyloguj się'],
            ['group' => 'nav', 'key' => 'account', 'en' => 'Account', 'pl' => 'Konto'],
            ['group' => 'nav', 'key' => 'orders', 'en' => 'Orders', 'pl' => 'Zamówienia'],
            ['group' => 'nav', 'key' => 'profile', 'en' => 'Profile', 'pl' => 'Profil'],
            ['group' => 'nav', 'key' => 'addresses', 'en' => 'Addresses', 'pl' => 'Adresy'],

            // ── cart ───────────────────────────────────────────────────────────
            ['group' => 'cart', 'key' => 'empty', 'en' => 'Your cart is empty', 'pl' => 'Twój koszyk jest pusty'],
            ['group' => 'cart', 'key' => 'empty_subtitle', 'en' => 'Add some products to get started', 'pl' => 'Dodaj produkty, aby zacząć'],
            ['group' => 'cart', 'key' => 'items', 'en' => 'Items', 'pl' => 'Produkty'],
            ['group' => 'cart', 'key' => 'subtotal', 'en' => 'Subtotal', 'pl' => 'Suma częściowa'],
            ['group' => 'cart', 'key' => 'shipping', 'en' => 'Shipping', 'pl' => 'Dostawa'],
            ['group' => 'cart', 'key' => 'free_shipping', 'en' => 'Free shipping', 'pl' => 'Darmowa dostawa'],
            ['group' => 'cart', 'key' => 'total', 'en' => 'Total', 'pl' => 'Razem'],
            ['group' => 'cart', 'key' => 'checkout', 'en' => 'Checkout', 'pl' => 'Przejdź do kasy'],
            ['group' => 'cart', 'key' => 'browse_products', 'en' => 'Browse products', 'pl' => 'Przeglądaj produkty'],
            ['group' => 'cart', 'key' => 'remove', 'en' => 'Remove', 'pl' => 'Usuń'],
            ['group' => 'cart', 'key' => 'quantity', 'en' => 'Quantity', 'pl' => 'Ilość'],

            // ── checkout ───────────────────────────────────────────────────────
            ['group' => 'checkout', 'key' => 'title', 'en' => 'Checkout', 'pl' => 'Kasa'],
            ['group' => 'checkout', 'key' => 'billing_address', 'en' => 'Billing Address', 'pl' => 'Adres rozliczeniowy'],
            ['group' => 'checkout', 'key' => 'shipping_address', 'en' => 'Shipping Address', 'pl' => 'Adres dostawy'],
            ['group' => 'checkout', 'key' => 'same_address', 'en' => 'Same as billing address', 'pl' => 'Taki sam jak adres rozliczeniowy'],
            ['group' => 'checkout', 'key' => 'save_address', 'en' => 'Save address', 'pl' => 'Zapisz adres'],
            ['group' => 'checkout', 'key' => 'shipping_method', 'en' => 'Shipping Method', 'pl' => 'Metoda dostawy'],
            ['group' => 'checkout', 'key' => 'payment_method', 'en' => 'Payment Method', 'pl' => 'Metoda płatności'],
            ['group' => 'checkout', 'key' => 'notes', 'en' => 'Order Notes', 'pl' => 'Uwagi do zamówienia'],
            ['group' => 'checkout', 'key' => 'notes_placeholder', 'en' => 'Any special instructions...', 'pl' => 'Specjalne instrukcje...'],
            ['group' => 'checkout', 'key' => 'place_order', 'en' => 'Place Order', 'pl' => 'Złóż zamówienie'],
            ['group' => 'checkout', 'key' => 'placing_order', 'en' => 'Placing order...', 'pl' => 'Składanie zamówienia...'],
            ['group' => 'checkout', 'key' => 'order_terms', 'en' => 'By placing your order you agree to our terms', 'pl' => 'Składając zamówienie akceptujesz nasze warunki'],
            ['group' => 'checkout', 'key' => 'free', 'en' => 'Free', 'pl' => 'Bezpłatna'],

            // ── product ────────────────────────────────────────────────────────
            ['group' => 'product', 'key' => 'add_to_cart', 'en' => 'Add to Cart', 'pl' => 'Dodaj do koszyka'],
            ['group' => 'product', 'key' => 'out_of_stock', 'en' => 'Out of Stock', 'pl' => 'Niedostępny'],
            ['group' => 'product', 'key' => 'reviews', 'en' => 'Reviews', 'pl' => 'Opinie'],
            ['group' => 'product', 'key' => 'related_products', 'en' => 'Related Products', 'pl' => 'Podobne produkty'],
            ['group' => 'product', 'key' => 'from_price', 'en' => 'From', 'pl' => 'Od'],

            // ── blog ───────────────────────────────────────────────────────────
            ['group' => 'blog', 'key' => 'title', 'en' => 'Blog', 'pl' => 'Blog'],
            ['group' => 'blog', 'key' => 'subtitle', 'en' => 'Latest news and articles', 'pl' => 'Najnowsze wiadomości i artykuły'],
            ['group' => 'blog', 'key' => 'back', 'en' => 'Back to Blog', 'pl' => 'Wróć do bloga'],
            ['group' => 'blog', 'key' => 'by', 'en' => 'By', 'pl' => 'Autor'],
            ['group' => 'blog', 'key' => 'min_read', 'en' => 'min read', 'pl' => 'min czytania'],
            ['group' => 'blog', 'key' => 'all_categories', 'en' => 'All Categories', 'pl' => 'Wszystkie kategorie'],
            ['group' => 'blog', 'key' => 'no_posts', 'en' => 'No posts found', 'pl' => 'Nie znaleziono wpisów'],

            // ── account ────────────────────────────────────────────────────────
            ['group' => 'account', 'key' => 'my_orders', 'en' => 'My Orders', 'pl' => 'Moje zamówienia'],
            ['group' => 'account', 'key' => 'my_profile', 'en' => 'My Profile', 'pl' => 'Mój profil'],
            ['group' => 'account', 'key' => 'addresses', 'en' => 'Addresses', 'pl' => 'Adresy'],
            ['group' => 'account', 'key' => 'logout', 'en' => 'Logout', 'pl' => 'Wyloguj się'],
            ['group' => 'account', 'key' => 'order_number', 'en' => 'Order #', 'pl' => 'Zamówienie #'],
            ['group' => 'account', 'key' => 'order_date', 'en' => 'Date', 'pl' => 'Data'],
            ['group' => 'account', 'key' => 'order_status', 'en' => 'Status', 'pl' => 'Status'],
            ['group' => 'account', 'key' => 'order_total', 'en' => 'Total', 'pl' => 'Razem'],
            ['group' => 'account', 'key' => 'view_order', 'en' => 'View Order', 'pl' => 'Zobacz zamówienie'],

            // ── auth ───────────────────────────────────────────────────────────
            ['group' => 'auth', 'key' => 'login_title', 'en' => 'Sign In', 'pl' => 'Zaloguj się'],
            ['group' => 'auth', 'key' => 'register_title', 'en' => 'Create Account', 'pl' => 'Utwórz konto'],
            ['group' => 'auth', 'key' => 'email', 'en' => 'Email address', 'pl' => 'Adres e-mail'],
            ['group' => 'auth', 'key' => 'password', 'en' => 'Password', 'pl' => 'Hasło'],
            ['group' => 'auth', 'key' => 'confirm_password', 'en' => 'Confirm Password', 'pl' => 'Potwierdź hasło'],
            ['group' => 'auth', 'key' => 'forgot_password', 'en' => 'Forgot password?', 'pl' => 'Zapomniałeś hasła?'],
            ['group' => 'auth', 'key' => 'login_btn', 'en' => 'Sign In', 'pl' => 'Zaloguj się'],
            ['group' => 'auth', 'key' => 'register_btn', 'en' => 'Create Account', 'pl' => 'Utwórz konto'],
            ['group' => 'auth', 'key' => 'no_account', 'en' => "Don't have an account?", 'pl' => 'Nie masz konta?'],
            ['group' => 'auth', 'key' => 'have_account', 'en' => 'Already have an account?', 'pl' => 'Masz już konto?'],

            // ── common ─────────────────────────────────────────────────────────
            ['group' => 'common', 'key' => 'loading', 'en' => 'Loading...', 'pl' => 'Ładowanie...'],
            ['group' => 'common', 'key' => 'error_generic', 'en' => 'Something went wrong', 'pl' => 'Coś poszło nie tak'],
            ['group' => 'common', 'key' => 'save', 'en' => 'Save', 'pl' => 'Zapisz'],
            ['group' => 'common', 'key' => 'cancel', 'en' => 'Cancel', 'pl' => 'Anuluj'],
            ['group' => 'common', 'key' => 'close', 'en' => 'Close', 'pl' => 'Zamknij'],
            ['group' => 'common', 'key' => 'confirm', 'en' => 'Confirm', 'pl' => 'Potwierdź'],
            ['group' => 'common', 'key' => 'delete', 'en' => 'Delete', 'pl' => 'Usuń'],
            ['group' => 'common', 'key' => 'edit', 'en' => 'Edit', 'pl' => 'Edytuj'],
            ['group' => 'common', 'key' => 'search', 'en' => 'Search', 'pl' => 'Szukaj'],
            ['group' => 'common', 'key' => 'no_results', 'en' => 'No results found', 'pl' => 'Nie znaleziono wyników'],

            // ── shop (products listing page) ───────────────────────────────────
            ['group' => 'shop', 'key' => 'title', 'en' => 'Shop', 'pl' => 'Sklep'],
            ['group' => 'shop', 'key' => 'products_suffix', 'en' => 'products', 'pl' => 'produktów'],
            ['group' => 'shop', 'key' => 'search_placeholder', 'en' => 'Search products…', 'pl' => 'Szukaj produktów…'],
            ['group' => 'shop', 'key' => 'sort_default', 'en' => 'Default', 'pl' => 'Domyślnie'],
            ['group' => 'shop', 'key' => 'sort_price_asc', 'en' => 'Price: Low to High', 'pl' => 'Cena: rosnąco'],
            ['group' => 'shop', 'key' => 'sort_price_desc', 'en' => 'Price: High to Low', 'pl' => 'Cena: malejąco'],
            ['group' => 'shop', 'key' => 'sort_newest', 'en' => 'Newest', 'pl' => 'Najnowsze'],
            ['group' => 'shop', 'key' => 'filters', 'en' => 'Filters', 'pl' => 'Filtry'],
            ['group' => 'shop', 'key' => 'min_price', 'en' => 'Min Price', 'pl' => 'Cena min'],
            ['group' => 'shop', 'key' => 'max_price', 'en' => 'Max Price', 'pl' => 'Cena maks'],
            ['group' => 'shop', 'key' => 'clear_filters', 'en' => 'Clear all filters', 'pl' => 'Wyczyść filtry'],
            ['group' => 'shop', 'key' => 'no_products', 'en' => 'No products found.', 'pl' => 'Nie znaleziono produktów.'],
            ['group' => 'shop', 'key' => 'clear_filters_link', 'en' => 'Clear filters', 'pl' => 'Wyczyść filtry'],

            // ── cart additions ─────────────────────────────────────────────────
            ['group' => 'cart', 'key' => 'your_cart', 'en' => 'Your Cart', 'pl' => 'Twój koszyk'],
            ['group' => 'cart', 'key' => 'order_summary', 'en' => 'Order Summary', 'pl' => 'Podsumowanie zamówienia'],
            ['group' => 'cart', 'key' => 'calculated_at_checkout', 'en' => 'Calculated at checkout', 'pl' => 'Naliczane przy kasie'],
            ['group' => 'cart', 'key' => 'discount', 'en' => 'Discount', 'pl' => 'Rabat'],
            ['group' => 'cart', 'key' => 'proceed', 'en' => 'Proceed to Checkout', 'pl' => 'Przejdź do kasy'],
            ['group' => 'cart', 'key' => 'continue_shopping', 'en' => 'Continue Shopping', 'pl' => 'Kontynuuj zakupy'],
            ['group' => 'cart', 'key' => 'start_shopping', 'en' => 'Start Shopping', 'pl' => 'Zacznij zakupy'],
            ['group' => 'cart', 'key' => 'empty_desc', 'en' => 'Your cart is empty.', 'pl' => 'Twój koszyk jest pusty.'],

            // ── checkout payment methods ────────────────────────────────────────
            ['group' => 'checkout', 'key' => 'method_blik',                    'en' => 'BLIK',                                          'pl' => 'BLIK'],
            ['group' => 'checkout', 'key' => 'method_blik_desc',               'en' => 'Pay with a BLIK code from your banking app',    'pl' => 'Zapłać kodem BLIK z aplikacji bankowej'],
            ['group' => 'checkout', 'key' => 'method_p24',                     'en' => 'Przelewy24',                                    'pl' => 'Przelewy24'],
            ['group' => 'checkout', 'key' => 'method_p24_desc',                'en' => 'Bank transfer, card, BLIK and other methods',   'pl' => 'Przelew, karta, BLIK i inne metody'],
            ['group' => 'checkout', 'key' => 'method_cod',                     'en' => 'Cash on Delivery',                              'pl' => 'Płatność przy dostawie'],
            ['group' => 'checkout', 'key' => 'method_cod_desc',                'en' => 'Pay the courier upon delivery',                 'pl' => 'Zapłać kurierowi przy odbiorze przesyłki'],
            ['group' => 'checkout', 'key' => 'method_cod_pickup',              'en' => 'Pay at pickup',                                 'pl' => 'Płatność przy odbiorze w sklepie'],
            ['group' => 'checkout', 'key' => 'method_cod_pickup_desc',         'en' => 'Pay in-store when collecting your order',       'pl' => 'Zapłać gotówką w sklepie przy odbiorze zamówienia'],
            ['group' => 'checkout', 'key' => 'method_bank_transfer',           'en' => 'Bank Transfer',                                 'pl' => 'Przelew bankowy'],
            ['group' => 'checkout', 'key' => 'method_bank_transfer_desc',      'en' => 'Transfer funds to our bank account',            'pl' => 'Przelej środki na nasze konto bankowe'],
            ['group' => 'checkout', 'key' => 'bank_transfer_instructions',     'en' => 'Transfer details',                              'pl' => 'Dane do przelewu'],
            ['group' => 'checkout', 'key' => 'bank_transfer_account_name',     'en' => 'Account holder',                                'pl' => 'Właściciel konta'],
            ['group' => 'checkout', 'key' => 'bank_transfer_bank_name',        'en' => 'Bank',                                          'pl' => 'Bank'],
            ['group' => 'checkout', 'key' => 'bank_transfer_iban',             'en' => 'IBAN',                                          'pl' => 'IBAN'],
            ['group' => 'checkout', 'key' => 'bank_transfer_swift',            'en' => 'SWIFT / BIC',                                   'pl' => 'SWIFT / BIC'],
            ['group' => 'checkout', 'key' => 'bank_transfer_amount',           'en' => 'Amount',                                        'pl' => 'Kwota'],
            ['group' => 'checkout', 'key' => 'bank_transfer_reference',        'en' => 'Transfer title',                                'pl' => 'Tytuł przelewu'],
            ['group' => 'checkout', 'key' => 'bank_transfer_note',             'en' => 'Your order will be processed after we receive the payment.', 'pl' => 'Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.'],
            ['group' => 'checkout', 'key' => 'bank_transfer_after_order',    'en' => 'Bank account details will be shown after you place your order.', 'pl' => 'Dane do przelewu zostaną wyświetlone po złożeniu zamówienia.'],
            ['group' => 'checkout', 'key' => 'next_step_2_bank',               'en' => 'Complete your bank transfer using the details above.',     'pl' => 'Wykonaj przelew bankowy korzystając z powyższych danych.'],

            // ── checkout guest / success ───────────────────────────────────────
            ['group' => 'checkout', 'key' => 'guest_email_title',  'en' => 'Your Email Address',                                       'pl' => 'Twój adres e-mail'],
            ['group' => 'checkout', 'key' => 'guest_email_hint',   'en' => "We'll send your order confirmation here.",                 'pl' => 'Wyślemy potwierdzenie zamówienia na ten adres.'],
            ['group' => 'checkout', 'key' => 'guest_email_required', 'en' => 'Email address is required.',                             'pl' => 'Adres e-mail jest wymagany.'],
            ['group' => 'checkout', 'key' => 'success_title',      'en' => 'Order Placed!',                                            'pl' => 'Zamówienie złożone!'],
            ['group' => 'checkout', 'key' => 'success_desc',       'en' => "Thank you for your order. We've sent a confirmation to your email address.", 'pl' => 'Dziękujemy za zamówienie. Wysłaliśmy potwierdzenie na Twój adres e-mail.'],
            ['group' => 'checkout', 'key' => 'whats_next',         'en' => "What's next?",                                            'pl' => 'Co dalej?'],
            ['group' => 'checkout', 'key' => 'next_step_1',        'en' => "You'll receive an order confirmation email.",              'pl' => 'Otrzymasz e-mail z potwierdzeniem zamówienia.'],
            ['group' => 'checkout', 'key' => 'next_step_2',        'en' => "We'll notify you when your order has been shipped.",       'pl' => 'Powiadomimy Cię, gdy zamówienie zostanie wysłane.'],
            ['group' => 'checkout', 'key' => 'next_step_3',        'en' => 'Track your order in your account.',                       'pl' => 'Śledź zamówienie w swoim koncie.'],
            ['group' => 'checkout', 'key' => 'next_step_3_guest',  'en' => 'Save your order reference number to follow up later.',    'pl' => 'Zapisz numer referencyjny zamówienia, aby śledzić jego status.'],
            ['group' => 'checkout', 'key' => 'continue_shopping',  'en' => 'Continue Shopping',                                       'pl' => 'Kontynuuj zakupy'],

            // ── checkout additions ─────────────────────────────────────────────
            ['group' => 'checkout', 'key' => 'empty_cart', 'en' => 'Cart is empty', 'pl' => 'Koszyk jest pusty'],
            ['group' => 'checkout', 'key' => 'empty_cart_desc', 'en' => 'Add items to your cart before checkout.', 'pl' => 'Dodaj produkty do koszyka przed złożeniem zamówienia.'],
            ['group' => 'checkout', 'key' => 'summary', 'en' => 'Order Summary', 'pl' => 'Podsumowanie zamówienia'],
            ['group' => 'checkout', 'key' => 'products', 'en' => 'Products', 'pl' => 'Produkty'],
            ['group' => 'checkout', 'key' => 'discount', 'en' => 'Discount', 'pl' => 'Rabat'],
            ['group' => 'checkout', 'key' => 'error', 'en' => 'Error', 'pl' => 'Błąd'],
            ['group' => 'checkout', 'key' => 'cod', 'en' => 'Cash on Delivery', 'pl' => 'Płatność przy odbiorze'],
            ['group' => 'checkout', 'key' => 'cod_desc', 'en' => 'Pay with cash upon delivery or in-store.', 'pl' => 'Zapłać gotówką przy odbiorze przesyłki lub w sklepie.'],
            ['group' => 'checkout', 'key' => 'save_billing', 'en' => 'Save billing address to account', 'pl' => 'Zapisz adres rozliczeniowy do konta'],
            ['group' => 'checkout', 'key' => 'save_shipping', 'en' => 'Save shipping address to account', 'pl' => 'Zapisz adres dostawy do konta'],
            ['group' => 'checkout', 'key' => 'same_as_billing', 'en' => 'Shipping address same as billing', 'pl' => 'Adres dostawy taki sam jak rozliczeniowy'],
            ['group' => 'checkout', 'key' => 'business_days', 'en' => 'business days', 'pl' => 'dni roboczych'],
            ['group' => 'checkout', 'key' => 'optional_notes', 'en' => 'Order Notes (optional)', 'pl' => 'Uwagi do zamówienia (opcjonalnie)'],
            ['group' => 'checkout', 'key' => 'order_terms', 'en' => 'By clicking "Place Order" you agree to the terms of sale.', 'pl' => 'Klikając "Złóż zamówienie" akceptujesz warunki sprzedaży.'],
            ['group' => 'checkout', 'key' => 'browse_products', 'en' => 'Browse products', 'pl' => 'Przeglądaj produkty'],

            // ── address form ───────────────────────────────────────────────────
            ['group' => 'address', 'key' => 'first_name', 'en' => 'First Name *', 'pl' => 'Imię *'],
            ['group' => 'address', 'key' => 'last_name', 'en' => 'Last Name *', 'pl' => 'Nazwisko *'],
            ['group' => 'address', 'key' => 'company', 'en' => 'Company', 'pl' => 'Firma'],
            ['group' => 'address', 'key' => 'street', 'en' => 'Street & Number *', 'pl' => 'Ulica i numer *'],
            ['group' => 'address', 'key' => 'postal_code', 'en' => 'Postal Code *', 'pl' => 'Kod pocztowy *'],
            ['group' => 'address', 'key' => 'city', 'en' => 'City *', 'pl' => 'Miasto *'],
            ['group' => 'address', 'key' => 'country', 'en' => 'Country *', 'pl' => 'Kraj *'],
            ['group' => 'address', 'key' => 'phone', 'en' => 'Phone *', 'pl' => 'Telefon *'],
            ['group' => 'address', 'key' => 'saved_address_label', 'en' => 'Select saved address', 'pl' => 'Wybierz zapisany adres'],
            ['group' => 'address', 'key' => 'select_address', 'en' => '— Select address —', 'pl' => '— Wybierz adres —'],
            ['group' => 'address', 'key' => 'default_suffix', 'en' => '(default)', 'pl' => '(domyślny)'],

            // ── newsletter ─────────────────────────────────────────────────────
            ['group' => 'newsletter', 'key' => 'placeholder', 'en' => 'Your email', 'pl' => 'Twój email'],
            ['group' => 'newsletter', 'key' => 'subscribe', 'en' => 'Subscribe', 'pl' => 'Subskrybuj'],
            ['group' => 'newsletter', 'key' => 'success', 'en' => 'Check your inbox to confirm your subscription!', 'pl' => 'Sprawdź skrzynkę, aby potwierdzić subskrypcję!'],
            ['group' => 'newsletter', 'key' => 'error', 'en' => 'Something went wrong.', 'pl' => 'Coś poszło nie tak.'],

            // ── account additions ──────────────────────────────────────────────
            ['group' => 'account', 'key' => 'no_orders', 'en' => "You haven't placed any orders yet.", 'pl' => 'Nie złożyłeś jeszcze żadnych zamówień.'],
            ['group' => 'account', 'key' => 'start_shopping', 'en' => 'Start Shopping', 'pl' => 'Zacznij zakupy'],
            ['group' => 'account', 'key' => 'sign_out', 'en' => 'Sign out', 'pl' => 'Wyloguj się'],
            ['group' => 'account', 'key' => 'user_account', 'en' => 'User account', 'pl' => 'Konto użytkownika'],
            ['group' => 'account', 'key' => 'my_account_dropdown', 'en' => 'My Account', 'pl' => 'Moje konto'],

            // ── auth additions ─────────────────────────────────────────────────
            ['group' => 'auth', 'key' => 'welcome_back', 'en' => 'Welcome back! Enter your details to continue.', 'pl' => 'Witaj ponownie! Wprowadź dane, aby kontynuować.'],
            ['group' => 'auth', 'key' => 'full_name', 'en' => 'Full Name', 'pl' => 'Imię i nazwisko'],
            ['group' => 'auth', 'key' => 'sign_up', 'en' => 'Sign up', 'pl' => 'Zarejestruj się'],
            ['group' => 'auth', 'key' => 'sign_in_link', 'en' => 'Sign in', 'pl' => 'Zaloguj się'],
            ['group' => 'auth', 'key' => 'register_desc', 'en' => 'Join us to unlock your full shopping experience.', 'pl' => 'Dołącz do nas i odkryj pełnię zakupów.'],

            // ── product additions ──────────────────────────────────────────────
            ['group' => 'product', 'key' => 'no_image', 'en' => 'No image', 'pl' => 'Brak zdjęcia'],
            ['group' => 'product', 'key' => 'unavailable', 'en' => 'Unavailable', 'pl' => 'Niedostępny'],
            ['group' => 'product', 'key' => 'description', 'en' => 'Description', 'pl' => 'Opis'],
            ['group' => 'product', 'key' => 'no_description', 'en' => 'No description available.', 'pl' => 'Brak opisu.'],
            ['group' => 'product', 'key' => 'adding', 'en' => 'Adding…', 'pl' => 'Dodawanie…'],
            ['group' => 'product', 'key' => 'added_to_cart', 'en' => 'Added to cart!', 'pl' => 'Dodano do koszyka!'],
            ['group' => 'product', 'key' => 'no_variant', 'en' => 'No variant available', 'pl' => 'Brak dostępnego wariantu'],
            ['group' => 'product', 'key' => 'not_found', 'en' => 'Product not found.', 'pl' => 'Nie znaleziono produktu.'],
            ['group' => 'product', 'key' => 'back_to_shop', 'en' => 'Back to shop', 'pl' => 'Wróć do sklepu'],
            ['group' => 'product', 'key' => 'select_variant', 'en' => 'Select variant', 'pl' => 'Wybierz wariant'],
            ['group' => 'product', 'key' => 'tab_description', 'en' => 'Description', 'pl' => 'Opis'],
            ['group' => 'product', 'key' => 'tab_reviews', 'en' => 'Reviews', 'pl' => 'Opinie'],
            ['group' => 'product', 'key' => 'no_reviews', 'en' => 'No reviews yet.', 'pl' => 'Brak opinii.'],
            ['group' => 'product', 'key' => 'omnibus_label', 'en' => 'Lowest price in last 30 days', 'pl' => 'Najniższa cena z ostatnich 30 dni'],

            // ── footer ─────────────────────────────────────────────────────────
            ['group' => 'footer', 'key' => 'tagline', 'en' => 'Curated fashion, home décor and lifestyle essentials — crafted to last.', 'pl' => 'Starannie dobrana moda, wystrój wnętrz i akcesoria lifestyle.'],
            ['group' => 'footer', 'key' => 'quick_links', 'en' => 'Quick Links', 'pl' => 'Szybkie linki'],
            ['group' => 'footer', 'key' => 'newsletter', 'en' => 'Newsletter', 'pl' => 'Newsletter'],
            ['group' => 'footer', 'key' => 'newsletter_desc', 'en' => 'Get exclusive offers and style inspiration.', 'pl' => 'Ekskluzywne oferty i inspiracje stylistyczne.'],
            ['group' => 'footer', 'key' => 'rights', 'en' => 'All rights reserved.', 'pl' => 'Wszelkie prawa zastrzeżone.'],

            // ── admin sidebar ──────────────────────────────────────────────────
            ['group' => 'admin', 'key' => 'nav.dashboard',          'en' => 'Dashboard',          'pl' => 'Panel'],
            ['group' => 'admin', 'key' => 'nav.media',               'en' => 'Media',              'pl' => 'Media'],
            ['group' => 'admin', 'key' => 'nav.cms',                 'en' => 'CMS',                'pl' => 'CMS'],
            ['group' => 'admin', 'key' => 'nav.pages',               'en' => 'Pages',              'pl' => 'Strony'],
            ['group' => 'admin', 'key' => 'nav.global_blocks',       'en' => 'Global Blocks',      'pl' => 'Bloki globalne'],
            ['group' => 'admin', 'key' => 'nav.menus',               'en' => 'Menus',              'pl' => 'Menu'],
            ['group' => 'admin', 'key' => 'nav.themes',              'en' => 'Themes',             'pl' => 'Motywy'],
            ['group' => 'admin', 'key' => 'nav.forms',               'en' => 'Forms',              'pl' => 'Formularze'],
            ['group' => 'admin', 'key' => 'nav.faq',                 'en' => 'FAQ',                'pl' => 'FAQ'],
            ['group' => 'admin', 'key' => 'nav.section_templates',   'en' => 'Section Templates',  'pl' => 'Szablony sekcji'],
            ['group' => 'admin', 'key' => 'nav.stores',              'en' => 'Stores',             'pl' => 'Sklepy'],
            ['group' => 'admin', 'key' => 'nav.blog_posts',          'en' => 'Blog Posts',         'pl' => 'Posty blogowe'],
            ['group' => 'admin', 'key' => 'nav.blog_categories',     'en' => 'Blog Categories',    'pl' => 'Kategorie bloga'],
            ['group' => 'admin', 'key' => 'nav.shop',                'en' => 'Shop',               'pl' => 'Sklep'],
            ['group' => 'admin', 'key' => 'nav.products',            'en' => 'Products',           'pl' => 'Produkty'],
            ['group' => 'admin', 'key' => 'nav.categories',          'en' => 'Categories',         'pl' => 'Kategorie'],
            ['group' => 'admin', 'key' => 'nav.brands',              'en' => 'Brands',             'pl' => 'Marki'],
            ['group' => 'admin', 'key' => 'nav.product_types',       'en' => 'Product Types',      'pl' => 'Typy produktów'],
            ['group' => 'admin', 'key' => 'nav.attributes',          'en' => 'Attributes',         'pl' => 'Atrybuty'],
            ['group' => 'admin', 'key' => 'nav.product_flags',       'en' => 'Product Flags',      'pl' => 'Flagi produktów'],
            ['group' => 'admin', 'key' => 'nav.orders',              'en' => 'Orders',             'pl' => 'Zamówienia'],
            ['group' => 'admin', 'key' => 'nav.customers',           'en' => 'Customers',          'pl' => 'Klienci'],
            ['group' => 'admin', 'key' => 'nav.discounts',           'en' => 'Discounts',          'pl' => 'Zniżki'],
            ['group' => 'admin', 'key' => 'nav.promotions',          'en' => 'Promotions',         'pl' => 'Promocje'],
            ['group' => 'admin', 'key' => 'nav.tax_rates',           'en' => 'Tax Rates',          'pl' => 'Stawki VAT'],
            ['group' => 'admin', 'key' => 'nav.shipping',            'en' => 'Shipping',           'pl' => 'Dostawa'],
            ['group' => 'admin', 'key' => 'nav.returns',             'en' => 'Returns',            'pl' => 'Zwroty'],
            ['group' => 'admin', 'key' => 'nav.reviews',             'en' => 'Reviews',            'pl' => 'Recenzje'],
            ['group' => 'admin', 'key' => 'nav.newsletter',          'en' => 'Newsletter',         'pl' => 'Newsletter'],
            ['group' => 'admin', 'key' => 'nav.subscribers',         'en' => 'Subscribers',        'pl' => 'Subskrybenci'],
            ['group' => 'admin', 'key' => 'nav.segments',            'en' => 'Segments',           'pl' => 'Segmenty'],
            ['group' => 'admin', 'key' => 'nav.campaigns',           'en' => 'Campaigns',          'pl' => 'Kampanie'],
            ['group' => 'admin', 'key' => 'nav.finance',             'en' => 'Finance',            'pl' => 'Finanse'],
            ['group' => 'admin', 'key' => 'nav.currencies',          'en' => 'Currencies',         'pl' => 'Waluty'],
            ['group' => 'admin', 'key' => 'nav.exchange_rates',      'en' => 'Exchange Rates',     'pl' => 'Kursy walut'],
            ['group' => 'admin', 'key' => 'nav.users',               'en' => 'Users',              'pl' => 'Użytkownicy'],
            ['group' => 'admin', 'key' => 'nav.notifications',       'en' => 'Notifications',      'pl' => 'Powiadomienia'],
            ['group' => 'admin', 'key' => 'nav.activity_log',        'en' => 'Activity Log',       'pl' => 'Dziennik aktywności'],
            ['group' => 'admin', 'key' => 'nav.cookie_consents',     'en' => 'Cookie Consents',    'pl' => 'Zgody cookie'],
            ['group' => 'admin', 'key' => 'nav.i18n',                'en' => 'i18n',               'pl' => 'i18n'],
            ['group' => 'admin', 'key' => 'nav.locales',             'en' => 'Locales',            'pl' => 'Języki'],
            ['group' => 'admin', 'key' => 'nav.translations',        'en' => 'Translations',       'pl' => 'Tłumaczenia'],
            ['group' => 'admin', 'key' => 'nav.affiliates',          'en' => 'Affiliates',         'pl' => 'Afiliacja'],
            ['group' => 'admin', 'key' => 'nav.affiliate_codes',     'en' => 'Codes',              'pl' => 'Kody'],
            ['group' => 'admin', 'key' => 'nav.referrals',           'en' => 'Referrals',          'pl' => 'Rekomendacje'],
            ['group' => 'admin', 'key' => 'nav.support',             'en' => 'Support',            'pl' => 'Wsparcie'],
            ['group' => 'admin', 'key' => 'nav.conversations',       'en' => 'Conversations',      'pl' => 'Rozmowy'],
            ['group' => 'admin', 'key' => 'nav.canned_responses',    'en' => 'Canned Responses',   'pl' => 'Gotowe odpowiedzi'],
            ['group' => 'admin', 'key' => 'nav.settings',            'en' => 'Settings',           'pl' => 'Ustawienia'],
        ];

        foreach ($translations as $translation) {
            Translation::firstOrCreate(
                ['locale_code' => 'en', 'group' => $translation['group'], 'key' => $translation['key']],
                ['value' => $translation['en']]
            );
            Translation::firstOrCreate(
                ['locale_code' => 'pl', 'group' => $translation['group'], 'key' => $translation['key']],
                ['value' => $translation['pl']]
            );
        }
    }
}
