<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class PreviewController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $request->validate([
            'url' => ['required', 'string', 'max:2048'],
            'entity_type' => ['nullable', 'string', 'in:page,blog_post,product,category'],
            'entity_id' => ['nullable', 'integer'],
            'entity_name' => ['nullable', 'string', 'max:255'],
            'admin_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $adminUrl = $request->input('admin_url');
        if ($adminUrl && str_starts_with((string) $adminUrl, '/')) {
            $adminUrl = config('app.url').$adminUrl;
        }

        $payload = json_encode([
            'entity' => [
                'type' => $request->input('entity_type'),
                'id' => $request->input('entity_id'),
                'name' => $request->input('entity_name'),
                'admin_url' => $adminUrl,
            ],
        ]);

        $cookie = Cookie::make(
            name: 'admin_preview',
            value: $payload,
            minutes: 120,
            path: '/',
            secure: $request->isSecure(),
            httpOnly: false,
            sameSite: 'Lax',
        );

        return redirect()->away($request->input('url'))->withCookie($cookie);
    }
}
