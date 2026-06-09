<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Concerns\AddressValidationRules;
use App\Enums\PaymentProviderEnum;
use App\Models\ShippingMethod;
use App\Services\CartService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CheckoutRequest extends FormRequest
{
    use AddressValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $addressRules = $this->addressRules(phoneRequired: true, countryCodeRequired: true);

        $cartService = resolve(CartService::class);
        $cart = $cartService->getOrCreateCart($this->user('sanctum'), is_string($this->header('X-Cart-Token')) ? $this->header('X-Cart-Token') : null);

        $requiresShipping = $cart->items->contains(fn ($item) => $item->variant->product->productType->is_shippable ?? true);

        $rules = [
            'guest_email' => ['nullable', 'email', 'max:255'],
            'payment_provider' => ['required', 'string', new Enum(PaymentProviderEnum::class)],
            'payment_method' => ['nullable', 'string', Rule::in(['blik', 'card', 'apple_pay', 'google_pay', 'bank_transfer', 'paynow', 'paypo'])],
            'blik_code' => ['nullable', 'string', 'size:6', 'regex:/^\d{6}$/'],
            'payment_token' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'pickup_point_id' => ['nullable', 'string'],
            'referral_code' => ['nullable', 'string', 'max:50'],
            'ga_client_id' => ['nullable', 'string', 'max:255'],
            'terms_accepted' => ['required', 'accepted'],
            'billing_address' => ['required', 'array'],
        ];

        $rules = array_merge($rules, collect($addressRules)->mapWithKeys(fn ($r, $k): array => ['billing_address.'.$k => $r])->all());

        if ($requiresShipping) {
            $rules['shipping_method_id'] = ['required', 'integer', 'exists:shipping_methods,id'];
            $rules['shipping_address'] = ['required', 'array'];
            $rules = array_merge($rules, collect($addressRules)->mapWithKeys(fn ($r, $k): array => ['shipping_address.'.$k => $r])->all());
        } else {
            $rules['shipping_method_id'] = ['nullable', 'integer', 'exists:shipping_methods,id'];
            $rules['shipping_address'] = ['nullable', 'array'];
        }

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if (! $this->user('sanctum') && ! $this->input('guest_email')) {
                $v->errors()->add('guest_email', 'Email is required for guest checkout.');
            }

            if ($this->input('shipping_method_id')) {
                $shippingMethod = ShippingMethod::query()->find($this->input('shipping_method_id'));
                if ($shippingMethod && $shippingMethod->carrier->requiresPickupPoint() && ! $this->input('pickup_point_id')) {
                    $v->errors()->add('pickup_point_id', 'Wybór punktu odbioru jest wymagany dla tej metody dostawy.');
                }
            }
        });
    }
}
