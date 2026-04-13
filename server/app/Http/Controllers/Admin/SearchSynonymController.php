<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSearchSynonymRequest;
use App\Http\Requests\Admin\UpdateSearchSynonymRequest;
use App\Models\SearchSynonym;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class SearchSynonymController extends Controller
{
    public function index(): Response
    {
        $synonyms = SearchSynonym::query()
            ->orderBy('term')
            ->get();

        return inertia('admin/search/synonyms/index', [
            'synonyms' => $synonyms,
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/search/synonyms/create');
    }

    public function store(StoreSearchSynonymRequest $request): RedirectResponse
    {
        SearchSynonym::query()->create($request->validated());

        return to_route('admin.search.synonyms.index')
            ->with('success', 'Search synonym created successfully.');
    }

    public function edit(SearchSynonym $synonym): Response
    {
        return inertia('admin/search/synonyms/edit', [
            'synonym' => $synonym,
        ]);
    }

    public function update(UpdateSearchSynonymRequest $request, SearchSynonym $synonym): RedirectResponse
    {
        $synonym->update($request->validated());

        return to_route('admin.search.synonyms.index')
            ->with('success', 'Search synonym updated successfully.');
    }

    public function destroy(SearchSynonym $synonym): RedirectResponse
    {
        $synonym->delete();

        return to_route('admin.search.synonyms.index')
            ->with('success', 'Search synonym deleted.');
    }
}
