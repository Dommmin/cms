<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Validator;

class SectionValidationService
{
    /**
     * Validate section data against config rules
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $sectionConfig
     * @return array<string, mixed>
     */
    public function validateSectionData(array $data, array $sectionConfig): array
    {
        $rules = [];
        $messages = [];

        if (! isset($sectionConfig['fields'])) {
            return ['valid' => true, 'errors' => []];
        }

        foreach ($sectionConfig['fields'] as $field) {
            $fieldName = "configuration.{$field['name']}";
            $fieldRules = $this->buildValidationRules($field);
            $fieldMessages = $this->buildValidationMessages($field, $fieldName);

            if (! empty($fieldRules)) {
                $rules[$fieldName] = $fieldRules;
                $messages = array_merge($messages, $fieldMessages);
            }

            // Handle nested fields (groups, repeaters)
            if (isset($field['fields']) && is_array($field['fields'])) {
                foreach ($field['fields'] as $nestedField) {
                    $nestedFieldName = "{$fieldName}.{$nestedField['name']}";
                    $nestedRules = $this->buildValidationRules($nestedField);
                    $nestedMessages = $this->buildValidationMessages($nestedField, $nestedFieldName);

                    if (! empty($nestedRules)) {
                        $rules[$nestedFieldName] = $nestedRules;
                        $messages = array_merge($messages, $nestedMessages);
                    }
                }
            }
        }

        // Check business rules
        $businessRuleErrors = $this->validateBusinessRules($data, $sectionConfig);

        $validator = Validator::make($data, $rules, $messages);

        return [
            'valid' => $validator->passes() && empty($businessRuleErrors),
            'errors' => array_merge($validator->errors()->toArray(), $businessRuleErrors),
        ];
    }

    /**
     * Build validation rules from field config
     *
     * @param  array<string, mixed>  $field
     */
    private function buildValidationRules(array $field): string
    {
        $rules = [];

        if (isset($field['required']) && $field['required']) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        if (! isset($field['validation'])) {
            return implode('|', $rules);
        }

        $validation = $field['validation'];

        if (isset($validation['min'])) {
            if ($field['type'] === 'text' || $field['type'] === 'textarea') {
                $rules[] = "min:{$validation['min']}";
            } elseif ($field['type'] === 'number') {
                $rules[] = "min:{$validation['min']}";
            }
        }

        if (isset($validation['max'])) {
            if ($field['type'] === 'text' || $field['type'] === 'textarea') {
                $rules[] = "max:{$validation['max']}";
            } elseif ($field['type'] === 'number') {
                $rules[] = "max:{$validation['max']}";
            }
        }

        if (isset($validation['mimes'])) {
            $mimes = is_array($validation['mimes']) ? implode(',', $validation['mimes']) : $validation['mimes'];
            $rules[] = "mimes:{$mimes}";
        }

        if (isset($validation['dimensions'])) {
            $dimensions = [];
            if (isset($validation['dimensions']['min_width'])) {
                $dimensions[] = "min_width={$validation['dimensions']['min_width']}";
            }
            if (isset($validation['dimensions']['min_height'])) {
                $dimensions[] = "min_height={$validation['dimensions']['min_height']}";
            }
            if (! empty($dimensions)) {
                $rules[] = 'dimensions:'.implode(',', $dimensions);
            }
        }

        return implode('|', $rules);
    }

    /**
     * Build validation messages from field config
     *
     * @param  array<string, mixed>  $field
     * @return array<string, string>
     */
    private function buildValidationMessages(array $field, string $fieldName): array
    {
        $messages = [];
        $label = $field['label'] ?? $field['name'];

        $messages["{$fieldName}.required"] = "Pole '{$label}' jest wymagane.";
        $messages["{$fieldName}.min"] = "Pole '{$label}' musi mieć minimum :min znaków.";
        $messages["{$fieldName}.max"] = "Pole '{$label}' może mieć maksimum :max znaków.";
        $messages["{$fieldName}.mimes"] = "Pole '{$label}' musi być plikiem typu: :values.";
        $messages["{$fieldName}.dimensions"] = "Pole '{$label}' ma nieprawidłowe wymiary.";

        return $messages;
    }

    /**
     * Validate business rules from config
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $sectionConfig
     * @return array<string, array<int, string>>
     */
    private function validateBusinessRules(array $data, array $sectionConfig): array
    {
        $errors = [];

        if (! isset($sectionConfig['business_rules'])) {
            return $errors;
        }

        $businessRules = $sectionConfig['business_rules'];

        // Check max instances per page
        if (isset($businessRules['max_per_page'])) {
            // This would need page context - skip for now
        }

        // Check required fields
        if (isset($businessRules['required_fields'])) {
            foreach ($businessRules['required_fields'] as $requiredField) {
                if (! isset($data['configuration'][$requiredField]) || empty($data['configuration'][$requiredField])) {
                    $errors["configuration.{$requiredField}"] = ["Pole '{$requiredField}' jest wymagane dla tego typu sekcji."];
                }
            }
        }

        return $errors;
    }
}
