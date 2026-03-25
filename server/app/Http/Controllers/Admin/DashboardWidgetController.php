<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDashboardWidgetRequest;
use App\Models\DashboardWidget;
use Database\Seeders\DashboardWidgetSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardWidgetController extends Controller
{
    /** Create a new widget */
    public function store(StoreDashboardWidgetRequest $request): RedirectResponse
    {
        $nextOrder = DashboardWidget::query()->max('order') + 1;

        DashboardWidget::query()->create([
            'title' => $request->title,
            'type' => $request->type,
            'size' => $request->size,
            'icon' => $request->icon ?? 'bar-chart',
            'color' => $request->color ?? 'blue',
            'is_active' => true,
            'order' => $nextOrder,
            'config' => $request->buildConfig(),
        ]);

        return back()->with('flash', ['success' => 'Widget created.']);
    }

    /** Toggle a widget's active state */
    public function update(Request $request, DashboardWidget $dashboardWidget): RedirectResponse
    {
        $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $dashboardWidget->update($request->only(['is_active', 'order']));

        return back();
    }

    /** Delete a widget */
    public function destroy(DashboardWidget $dashboardWidget): RedirectResponse
    {
        $dashboardWidget->delete();

        return back()->with('flash', ['success' => 'Widget deleted.']);
    }

    /** Restore all default widgets from seeder */
    public function reset(): RedirectResponse
    {
        resolve(DashboardWidgetSeeder::class)->run();

        return back();
    }
}
