<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Notifications\FormSubmissionNotification;
use App\Rules\TurnstileRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class FormController extends Controller
{
    public function submit(Request $request, int $id): JsonResponse
    {
        $form = Form::query()->where('id', $id)->where('is_active', true)->with('fields')->firstOrFail();

        if (! $form->allow_multiple) {
            $previousSubmission = FormSubmission::query()
                ->where('form_id', $form->id)
                ->where('ip', $request->ip())
                ->exists();

            if ($previousSubmission) {
                return response()->json([
                    'message' => 'You have already submitted this form.',
                ], 422);
            }
        }

        $request->validate([
            'cf_turnstile_response' => ['nullable', 'string', new TurnstileRule],
        ]);

        $rules = [];
        foreach ($form->fields as $field) {
            $fieldRules = [];
            if ($field->is_required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            match ($field->type) {
                'email' => $fieldRules[] = 'email',
                'number' => $fieldRules[] = 'numeric',
                'file' => $fieldRules[] = 'file',
                default => $fieldRules[] = 'string',
            };

            $rules["fields.{$field->name}"] = $fieldRules;
        }

        $validated = $request->validate($rules);

        $submission = FormSubmission::query()->create([
            'form_id' => $form->id,
            'payload' => $validated['fields'] ?? [],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($form->notification_email) {
            Notification::route('mail', $form->notification_email)
                ->notify(new FormSubmissionNotification($submission, $form));
        }

        return response()->json([
            'message' => $form->success_message ?? 'Form submitted successfully',
        ], 201);
    }
}
