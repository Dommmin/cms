<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        $users = User::query()->orderBy('name')->get(['id', 'name', 'email']);

        $logNames = Activity::query()->distinct()->pluck('log_name')->sort()->values();

        return inertia('admin/activity-log/index', [
            'activities' => $activities,
            'users' => $users,
            'log_names' => $logNames,
            'filters' => $request->only(['causer_id', 'log_name', 'event', 'date_from', 'date_to']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Activity::with('causer:id,name,email')->latest();

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->input('causer_id'))
                ->where('causer_type', User::class);
        }

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->input('log_name'));
        }

        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $filename = 'activity-log-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Date', 'User', 'Email', 'Action', 'Model', 'Subject ID', 'Changes'], escape: '\\');

            $query->chunk(500, function ($activities) use ($handle): void {
                foreach ($activities as $activity) {
                    fputcsv($handle, [
                        $activity->created_at->format('Y-m-d H:i:s'),
                        $activity->causer instanceof \Illuminate\Database\Eloquent\Model ? $activity->causer->getAttribute('name') : 'System',
                        $activity->causer instanceof \Illuminate\Database\Eloquent\Model ? $activity->causer->getAttribute('email') : '',
                        $activity->event ?? $activity->description,
                        $activity->log_name,
                        $activity->subject_id,
                        json_encode($activity->properties->toArray()),
                    ],
                        escape: '\\');
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
