<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use App\Queries\Admin\SettingsIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $settingsQuery = new SettingsIndexQuery($request);
        $settingsData = $settingsQuery->execute();
        $groups = $settingsQuery->getGroups();
        $currentGroup = $request->get('group', $groups[0] ?? 'general');

        return inertia('admin/settings/index', [
            'settings' => $settingsData,
            'groups' => $groups,
            'currentGroup' => $currentGroup,
            'filters' => $request->only(['search', 'group']),
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        foreach ($data['settings'] as $key => $rawValue) {
            $setting = Setting::query()->where('key', $key)->first();

            if (! $setting) {
                continue;
            }

            if ($setting->type === \App\Enums\SettingTypeEnum::Boolean) {
                $value = json_encode(filter_var($rawValue, FILTER_VALIDATE_BOOLEAN));
            } elseif ($setting->type === \App\Enums\SettingTypeEnum::Integer) {
                $value = json_encode((int) $rawValue);
            } elseif ($setting->type === \App\Enums\SettingTypeEnum::Encrypted && filled($rawValue)) {
                $value = json_encode(\Illuminate\Support\Facades\Crypt::encryptString((string) $rawValue));
            } else {
                $value = json_encode($rawValue === '' ? null : $rawValue);
            }

            $setting->getConnection()->table('settings')
                ->where('id', $setting->id)
                ->update(['value' => $value]);
        }

        // Flush cached mail config so the new values take effect immediately
        cache()->forget('settings.mail');

        return back()->with('success', 'Settings saved');
    }
}
