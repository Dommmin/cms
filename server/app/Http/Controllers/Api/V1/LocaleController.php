<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
            ->get(['code', 'name', 'native_name', 'flag_emoji', 'is_default'])
            ->all();

        return response()->json($locales);
    }
}
