<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::with('causer:id,name,email')
            ->latest();

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id)
                ->where('causer_type', User::class);
        }

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->paginate($request->integer('per_page', 50))->withQueryString();

        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        $logNames = Activity::distinct()->pluck('log_name')->sort()->values();

        return inertia('admin/activity-log/index', [
            'activities' => $activities,
            'users' => $users,
            'log_names' => $logNames,
            'filters' => $request->only(['causer_id', 'log_name', 'event', 'date_from', 'date_to']),
        ]);
    }
}
