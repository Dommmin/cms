<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSectionTemplateRequest;
use App\Http\Requests\Admin\UpdateSectionTemplateRequest;
use App\Models\SectionTemplate;
use App\Queries\Admin\SectionTemplateIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SectionTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $templates = (new SectionTemplateIndexQuery($request))->execute();
        $categories = SectionTemplate::query()->distinct()->pluck('category')->filter()->values();

        return inertia('admin/section-templates/index', [
            'templates' => $templates,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $categories = SectionTemplate::query()->distinct()->pluck('category')->filter()->values();

        return inertia('admin/section-templates/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreSectionTemplateRequest $request): RedirectResponse
    {
        SectionTemplate::create($request->validated());

        return redirect('/admin/section-templates')->with('success', 'Template created');
    }

    public function edit(SectionTemplate $sectionTemplate): Response
    {
        $categories = SectionTemplate::query()->distinct()->pluck('category')->filter()->values();

        return inertia('admin/section-templates/edit', [
            'template' => $sectionTemplate,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateSectionTemplateRequest $request, SectionTemplate $sectionTemplate): RedirectResponse
    {
        $sectionTemplate->update($request->validated());

        return back()->with('success', 'Template updated');
    }

    public function destroy(SectionTemplate $sectionTemplate): RedirectResponse
    {
        $sectionTemplate->delete();

        return redirect('/admin/section-templates')->with('success', 'Template deleted');
    }

    public function duplicate(SectionTemplate $sectionTemplate): RedirectResponse
    {
        SectionTemplate::create([
            'name' => $sectionTemplate->name.' (copy)',
            'section_type' => $sectionTemplate->section_type,
            'variant' => $sectionTemplate->variant,
            'preset_data' => $sectionTemplate->preset_data,
            'thumbnail' => $sectionTemplate->thumbnail,
            'is_global' => $sectionTemplate->is_global,
            'category' => $sectionTemplate->category,
        ]);

        return redirect('/admin/section-templates')->with('success', 'Template duplicated');
    }
}
