<?php

declare(strict_types=1);

namespace App\Modules\Core\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Domain\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Settings Controller
 * Moved to Core module
 */
final class SettingsController extends Controller
{
    /** GET /api/settings — public settings only (for frontend) */
    public function index(): JsonResponse
    {
        $settings = Setting::where('is_public', true)
            ->get()
            ->groupBy('group')
            ->map(fn($items) => $items->pluck('value', 'key'));

        return response()->json($settings);
    }

    /** GET /api/admin/settings — all settings (for admin panel) */
    public function adminIndex(): JsonResponse
    {
        $settings = Setting::all()
            ->groupBy('group')
            ->map(fn($items) => $items->map(fn($s) => [
                'key'         => $s->key,
                'value'       => $s->value,
                'type'        => $s->type->value,
                'description' => $s->description,
                'is_public'   => $s->is_public,
            ]));

        return response()->json($settings);
    }

    /** PUT /api/admin/settings */
    public function update(Request $request): JsonResponse
    {
        foreach ($request->settings as $setting) {
            Setting::set($setting['group'], $setting['key'], $setting['value']);
        }

        return response()->json(['message' => 'Settings updated']);
    }
}

