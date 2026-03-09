<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DashboardWidget;
use Database\Seeders\DashboardWidgetSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardWidgetController extends Controller
{
    /** Toggle a widget's active state */
    public function update(Request $request, DashboardWidget $dashboardWidget): RedirectResponse
    {
        $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $dashboardWidget->update($request->only(['is_active', 'order']));

        return redirect()->back();
    }

    /** Restore all default widgets from seeder */
    public function reset(): RedirectResponse
    {
        app(DashboardWidgetSeeder::class)->run();

        return redirect()->back();
    }
}
