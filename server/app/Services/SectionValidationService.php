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
            $fieldName = 'configuration.'.$field['name'];
            $fieldRules = $this->buildValidationRules($field);
            $fieldMessages = $this->buildValidationMessages($field, $fieldName);

            if ($fieldRules !== '' && $fieldRules !== '0') {
                $rules[$fieldName] = $fieldRules;
                $messages = array_merge($messages, $fieldMessages);
            }

            // Handle nested fields (groups, repeaters)
            if (isset($field['fields']) && is_array($field['fields'])) {
                foreach ($field['fields'] as $nestedField) {
                    $nestedFieldName = sprintf('%s.%s', $fieldName, $nestedField['name']);
                    $nestedRules = $this->buildValidationRules($nestedField);
                    $nestedMessages = $this->buildValidationMessages($nestedField, $nestedFieldName);

                    if ($nestedRules !== '' && $nestedRules !== '0') {
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
            'valid' => $validator->passes() && $businessRuleErrors === [],
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

        $rules[] = isset($field['required']) && $field['required'] ? 'required' : 'nullable';

        if (! isset($field['validation'])) {
            return implode('|', $rules);
        }

        $validation = $field['validation'];

        if (isset($validation['min'])) {
            if ($field['type'] === 'text' || $field['type'] === 'textarea') {
                $rules[] = 'min:'.$validation['min'];
            } elseif ($field['type'] === 'number') {
                $rules[] = 'min:'.$validation['min'];
            }
        }

        if (isset($validation['max'])) {
            if ($field['type'] === 'text' || $field['type'] === 'textarea') {
                $rules[] = 'max:'.$validation['max'];
            } elseif ($field['type'] === 'number') {
                $rules[] = 'max:'.$validation['max'];
            }
        }

        if (isset($validation['mimes'])) {
            $mimes = is_array($validation['mimes']) ? implode(',', $validation['mimes']) : $validation['mimes'];
            $rules[] = 'mimes:'.$mimes;
        }

        if (isset($validation['dimensions'])) {
            $dimensions = [];
            if (isset($validation['dimensions']['min_width'])) {
                $dimensions[] = 'min_width='.$validation['dimensions']['min_width'];
            }

            if (isset($validation['dimensions']['min_height'])) {
                $dimensions[] = 'min_height='.$validation['dimensions']['min_height'];
            }

            if ($dimensions !== []) {
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

        $messages[$fieldName.'.required'] = sprintf("Pole '%s' jest wymagane.", $label);
        $messages[$fieldName.'.min'] = sprintf("Pole '%s' musi mieć minimum :min znaków.", $label);
        $messages[$fieldName.'.max'] = sprintf("Pole '%s' może mieć maksimum :max znaków.", $label);
        $messages[$fieldName.'.mimes'] = sprintf("Pole '%s' musi być plikiem typu: :values.", $label);
        $messages[$fieldName.'.dimensions'] = sprintf("Pole '%s' ma nieprawidłowe wymiary.", $label);

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
                    $errors['configuration.'.$requiredField] = [sprintf("Pole '%s' jest wymagane dla tego typu sekcji.", $requiredField)];
                }
            }
        }

        return $errors;
    }
}
