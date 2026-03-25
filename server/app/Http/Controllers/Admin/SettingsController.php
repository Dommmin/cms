<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\SettingTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TestMailRequest;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Mail\TestMail;
use App\Models\Setting;
use App\Queries\Admin\SettingsIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Inertia\Response;
use Throwable;

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

            if ($setting->type === SettingTypeEnum::Boolean) {
                $value = json_encode(filter_var($rawValue, FILTER_VALIDATE_BOOLEAN));
            } elseif ($setting->type === SettingTypeEnum::Integer) {
                $value = json_encode((int) $rawValue);
            } elseif ($setting->type === SettingTypeEnum::Encrypted && filled($rawValue)) {
                $value = json_encode(Crypt::encryptString((string) $rawValue));
            } else {
                $value = json_encode($rawValue === '' ? null : $rawValue);
            }

            $setting->getConnection()->table('settings')
                ->where('id', $setting->id)
                ->update(['value' => $value]);
        }

        // Flush cached configs so the new values take effect immediately
        foreach (['settings.mail', 'settings.payments', 'settings.shipping', 'settings.integrations'] as $key) {
            cache()->forget($key);
        }

        return back()->with('success', 'Settings saved');
    }

    public function testMail(TestMailRequest $request): JsonResponse
    {
        try {
            Mail::to($request->validated('email'))->send(new TestMail(now()->toDateTimeString()));
        } catch (Throwable $throwable) {
            return response()->json(['message' => $throwable->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent successfully.']);
    }
}
