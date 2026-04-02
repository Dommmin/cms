<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Translation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TranslationController extends ApiController
{
    public function show(string $locale): JsonResponse
    {
        $translations = Cache::remember('translations.'.$locale, 3600, function () use ($locale): array {
            $rows = Translation::query()
                ->where('locale_code', $locale)
                ->select('group', 'key', 'value')
                ->get();

            if ($rows->isEmpty() && $locale !== 'en') {
                $rows = Translation::query()
                    ->where('locale_code', 'en')
                    ->select('group', 'key', 'value')
                    ->get();
            }

            return $rows->mapWithKeys(fn ($row): array => [sprintf('%s.%s', $row->group, $row->key) => $row->value])->all();
        });

        return $this->ok($translations);
    }
}
