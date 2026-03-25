<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFormRequest;
use App\Http\Requests\Admin\UpdateFormRequest;
use App\Models\Form;
use App\Queries\Admin\FormIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class FormController extends Controller
{
    public function index(Request $request): Response
    {
        $forms = new FormIndexQuery($request)->execute();

        return inertia('admin/forms/index', [
            'forms' => $forms,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/forms/create');
    }

    public function store(StoreFormRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Form::query()->create($data);

        return redirect('/admin/forms')->with('success', 'Form created');
    }

    public function edit(Form $form): Response
    {
        $form->load('fields');

        return inertia('admin/forms/edit', [
            'form' => $form,
        ]);
    }

    public function update(UpdateFormRequest $request, Form $form): RedirectResponse
    {
        $data = $request->validated();
        $fields = $data['fields'] ?? null;
        unset($data['fields']);

        $form->update($data);

        if (is_array($fields)) {
            $form->fields()->delete();

            foreach ($fields as $position => $fieldData) {
                $form->fields()->create([
                    'label' => $fieldData['label'],
                    'name' => $fieldData['name'],
                    'type' => $fieldData['type'],
                    'is_required' => $fieldData['is_required'] ?? false,
                    'options' => isset($fieldData['options']) ? array_values(array_filter($fieldData['options'])) : null,
                    'settings' => ['placeholder' => $fieldData['placeholder'] ?? null],
                    'validation' => null,
                    'position' => $position,
                ]);
            }
        }

        return back()->with('success', 'Form updated');
    }

    public function destroy(Form $form): RedirectResponse
    {
        $form->delete();

        return redirect('/admin/forms')->with('success', 'Form deleted');
    }
}
