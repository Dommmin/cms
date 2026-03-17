<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Locale;
use Illuminate\Http\JsonResponse;

class LocaleController extends Controller
{
    public function index(): JsonResponse
    {
        $locales = Locale::query()
            ->active()
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get(['code', 'name', 'native_name', 'flag_emoji', 'currency_code', 'is_default'])
            ->all();

        // Load currency + latest exchange rate for each locale
        $currencies = Currency::query()
            ->whereIn('code', collect($locales)->pluck('currency_code')->filter()->unique()->values()->all())
            ->with(['exchangeRates' => fn ($q) => $q->latest('fetched_at')->limit(1)])
            ->get()
            ->keyBy('code');

        $result = array_map(function ($locale) use ($currencies) {
            $data = [
                'code' => $locale->code,
                'name' => $locale->name,
                'native_name' => $locale->native_name,
                'flag_emoji' => $locale->flag_emoji,
                'is_default' => $locale->is_default,
                'currency_code' => $locale->currency_code,
                'currency' => null,
            ];

            if ($locale->currency_code && isset($currencies[$locale->currency_code])) {
                $currency = $currencies[$locale->currency_code];
                $rate = $currency->exchangeRates->first();

                $data['currency'] = [
                    'code' => $currency->code,
                    'symbol' => $currency->symbol,
                    'decimal_places' => $currency->decimal_places,
                    'is_base' => $currency->is_base,
                    'exchange_rate' => $rate ? (float) $rate->rate : 1.0,
                ];
            }

            return $data;
        }, $locales);

        return response()->json($result);
    }
}
