<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Form;
use App\Models\Page;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Page
 */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Page $page */
        $page = $this->resource;

        $resolvedForms = $this->resolveEmbeddedForms($page);

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'is_published' => $page->is_published,
            'page_type' => $page->page_type instanceof BackedEnum ? $page->page_type->value : $page->page_type,
            'module_name' => $page->module_name,
            'module_config' => $page->module_config,
            'content' => $page->content,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'seo_canonical' => $page->seo_canonical,
            'sections' => $page->relationLoaded('sections') ? $page->sections->map(fn ($section) => [
                'id' => $section->id,
                'section_type' => $section->section_type,
                'layout' => $section->layout,
                'variant' => $section->variant,
                'settings' => $section->settings,
                'position' => $section->position,
                'is_active' => (bool) $section->is_active,
                'blocks' => $section->relationLoaded('blocks') ? $section->blocks->map(fn ($block) => [
                    'id' => $block->id,
                    'type' => $block->type instanceof BackedEnum ? $block->type->value : $block->type,
                    'configuration' => $this->resolveBlockConfiguration($block, $resolvedForms),
                    'position' => $block->position,
                    'is_active' => (bool) $block->is_active,
                    'relations' => [],
                    'reusable_block_id' => $block->reusable_block_id,
                ]) : [],
            ]) : [],
        ];
    }

    /**
     * Batch-load all forms referenced by form_embed blocks on this page.
     *
     * @return Collection<int, Form>
     */
    private function resolveEmbeddedForms(Page $page): Collection
    {
        if (! $page->relationLoaded('sections')) {
            return collect();
        }

        $formIds = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(fn ($b) => ($b->type instanceof BackedEnum ? $b->type->value : $b->type) === 'form_embed')
            ->map(fn ($b) => ($b->configuration['form_id'] ?? null))
            ->filter()
            ->unique()
            ->values();

        if ($formIds->isEmpty()) {
            return collect();
        }

        return Form::with('fields')->whereIn('id', $formIds)->get()->keyBy('id');
    }

    /**
     * Merge resolved form data into a form_embed block's configuration.
     *
     * @param  Collection<int, Form>  $resolvedForms
     */
    private function resolveBlockConfiguration(mixed $block, Collection $resolvedForms): array
    {
        $config = $block->configuration ?? [];
        $type = $block->type instanceof BackedEnum ? $block->type->value : $block->type;

        if ($type !== 'form_embed') {
            return $config;
        }

        $formId = $config['form_id'] ?? null;

        if (! $formId || ! $resolvedForms->has($formId)) {
            return $config;
        }

        $form = $resolvedForms->get($formId);

        $config['form'] = [
            'id' => $form->id,
            'name' => $form->name,
            'success_message' => $form->success_message,
            'fields' => $form->fields
                ->sortBy('position')
                ->values()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'label' => $f->label,
                    'type' => $f->type instanceof BackedEnum ? $f->type->value : $f->type,
                    'is_required' => (bool) $f->is_required,
                    'placeholder' => $f->placeholder,
                    'options' => $f->options,
                    'position' => $f->position,
                ])
                ->all(),
        ];

        return $config;
    }
}
