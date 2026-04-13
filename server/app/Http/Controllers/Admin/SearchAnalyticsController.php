<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SearchLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SearchAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $days = $request->integer('days', 30);
        $cutoff = now()->subDays($days);

        $baseQuery = fn () => SearchLog::query()
            ->where('created_at', '>=', $cutoff)
            ->where('is_autocomplete', false);

        $topQueries = SearchLog::query()
            ->where('created_at', '>=', $cutoff)
            ->where('is_autocomplete', false)
            ->groupBy('query')
            ->selectRaw('query, COUNT(*) as count, ROUND(AVG(results_count), 1) as avg_results')
            ->orderByDesc('count')
            ->limit(50)
            ->get();

        $zeroResults = SearchLog::query()
            ->where('created_at', '>=', $cutoff)
            ->where('results_count', 0)
            ->where('is_autocomplete', false)
            ->groupBy('query')
            ->selectRaw('query, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        $dailyVolume = SearchLog::query()
            ->where('created_at', '>=', $cutoff)
            ->where('is_autocomplete', false)
            ->groupBy('date')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->orderBy('date')
            ->get();

        $totalSearches = $baseQuery()->count();
        $uniqueQueries = $baseQuery()->distinct('query')->count('query');
        $zeroResultCount = $baseQuery()->where('results_count', 0)->count();

        $stats = [
            'total_searches' => $totalSearches,
            'unique_queries' => $uniqueQueries,
            'zero_result_rate' => $totalSearches > 0
                ? round($zeroResultCount / $totalSearches * 100, 1)
                : 0,
        ];

        return Inertia::render('admin/search/analytics', [
            'topQueries' => $topQueries,
            'zeroResults' => $zeroResults,
            'dailyVolume' => $dailyVolume,
            'stats' => $stats,
            'days' => $days,
        ]);
    }
}
