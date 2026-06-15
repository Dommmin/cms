<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class PageBuilderSnapshotValidator
{
    private const int MAX_SECTIONS = 100;

    private const int MAX_BLOCKS_PER_SECTION = 100;

    private const int MAX_SNAPSHOT_BYTES = 1_048_576;

    public function __construct(
        private readonly BlockConfigurationValidator $configurationValidator,
        private readonly BlockValidationService $blockValidationService,
    ) {}

    /**
     * @param  array<string, mixed>  $snapshot
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function validateAndSanitize(array $snapshot, string $attribute = 'snapshot', ?User $user = null): array
    {
        return $this->validateSnapshot($snapshot, $attribute, $user, true);
    }

    /**
     * Draft autosaves intentionally avoid full block configuration validation.
     * Editors can preserve partial work without required-field errors, while the
     * snapshot still keeps a valid top-level Page Builder shape.
     *
     * @param  array<string, mixed>  $snapshot
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function validateDraftAndSanitize(array $snapshot, string $attribute = 'snapshot', ?User $user = null): array
    {
        return $this->validateSnapshot($snapshot, $attribute, $user, false);
    }

    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws ValidationException
     */
    public function validateRelationsForBlock(string $blockType, mixed $relations, string $attribute = 'relations_config'): array
    {
        $errors = [];
        $this->validateRelations($relations, $blockType, $attribute, $errors);
        $this->throwIfInvalid($errors);

        return is_array($relations) ? $relations : [];
    }

    /**
     * @param  array<string, mixed>  $snapshot
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    private function validateSnapshot(array $snapshot, string $attribute, ?User $user, bool $validateConfiguration): array
    {
        $errors = [];

        $encoded = json_encode($snapshot);
        if ($encoded === false || mb_strlen($encoded) > self::MAX_SNAPSHOT_BYTES) {
            $errors[$attribute][] = 'The '.$attribute.' must not exceed 1MB.';
        }

        $sections = $snapshot['sections'] ?? [];
        if (! is_array($sections)) {
            $errors[$attribute.'.sections'][] = 'The '.$attribute.'.sections field must be an array.';
            $this->throwIfInvalid($errors);
        }

        if (count($sections) > self::MAX_SECTIONS) {
            $errors[$attribute.'.sections'][] = 'The '.$attribute.'.sections field must not have more than '.self::MAX_SECTIONS.' items.';
        }

        $sectionTypes = array_keys((array) config('cms.sections', []));
        $blockTypes = array_keys((array) config('blocks.block_types', []));

        foreach ($sections as $sectionIndex => $section) {
            $sectionAttribute = $attribute.'.sections.'.$sectionIndex;

            if (! is_array($section)) {
                $errors[$sectionAttribute][] = 'The '.$sectionAttribute.' field must be an object.';

                continue;
            }

            $sectionType = $section['section_type'] ?? null;
            if (! is_string($sectionType) || ! in_array($sectionType, $sectionTypes, true)) {
                $errors[$sectionAttribute.'.section_type'][] = 'The selected '.$sectionAttribute.'.section_type is invalid.';
            }

            $blocks = $section['blocks'] ?? [];
            if (! is_array($blocks)) {
                $errors[$sectionAttribute.'.blocks'][] = 'The '.$sectionAttribute.'.blocks field must be an array.';

                continue;
            }

            if (count($blocks) > self::MAX_BLOCKS_PER_SECTION) {
                $errors[$sectionAttribute.'.blocks'][] = 'The '.$sectionAttribute.'.blocks field must not have more than '.self::MAX_BLOCKS_PER_SECTION.' items.';
            }

            foreach ($blocks as $blockIndex => $block) {
                $blockAttribute = $sectionAttribute.'.blocks.'.$blockIndex;

                if (! is_array($block)) {
                    $errors[$blockAttribute][] = 'The '.$blockAttribute.' field must be an object.';

                    continue;
                }

                $blockType = $block['type'] ?? null;
                if (! is_string($blockType) || ! in_array($blockType, $blockTypes, true)) {
                    $errors[$blockAttribute.'.type'][] = 'The selected '.$blockAttribute.'.type is invalid.';

                    continue;
                }

                $this->mergeErrors(
                    $errors,
                    $this->blockValidationService->validateSnapshotBlock($block, $blockAttribute),
                );

                if ($validateConfiguration) {
                    try {
                        $snapshot['sections'][$sectionIndex]['blocks'][$blockIndex]['configuration'] = $this->configurationValidator
                            ->validateAndSanitize($blockType, $block['configuration'] ?? [], $blockAttribute.'.configuration', $user);
                    } catch (ValidationException $exception) {
                        $this->mergeErrors($errors, $exception->errors());
                    }
                } elseif (! isset($block['configuration']) || ! is_array($block['configuration'])) {
                    $snapshot['sections'][$sectionIndex]['blocks'][$blockIndex]['configuration'] = [];
                }

                $this->validateRelations(
                    relations: $block['relations'] ?? [],
                    blockType: $blockType,
                    attribute: $blockAttribute.'.relations',
                    errors: $errors,
                );
            }
        }

        $this->throwIfInvalid($errors);

        return $snapshot;
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    private function validateRelations(mixed $relations, string $blockType, string $attribute, array &$errors): void
    {
        if ($relations === null) {
            return;
        }

        if (! is_array($relations)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be an array.';

            return;
        }

        $allowedRelations = config('blocks.block_types.'.$blockType.'.allowed_relations', []);
        $allowedRelations = is_array($allowedRelations) ? $allowedRelations : [];

        $relationTypes = (array) config('blocks.relation_types', []);
        $singleRelationCounts = [];

        foreach ($relations as $index => $relation) {
            $relationAttribute = $attribute.'.'.$index;

            if (! is_array($relation)) {
                $errors[$relationAttribute][] = 'The '.$relationAttribute.' field must be an object.';

                continue;
            }

            if (array_key_exists('type', $relation)) {
                $errors[$relationAttribute][] = 'Relations must use relation_type, relation_id, relation_key, position, and metadata keys.';
            }

            $relationKey = $relation['relation_key'] ?? null;
            $relationType = $relation['relation_type'] ?? null;
            $relationId = $relation['relation_id'] ?? null;

            if (! is_string($relationKey) || $relationKey === '') {
                $errors[$relationAttribute.'.relation_key'][] = 'The '.$relationAttribute.'.relation_key field is required.';

                continue;
            }

            if (! isset($allowedRelations[$relationKey]) || ! is_array($allowedRelations[$relationKey])) {
                $errors[$relationAttribute.'.relation_key'][] = 'The selected '.$relationAttribute.'.relation_key is invalid for this block type.';

                continue;
            }

            $allowedTypes = $allowedRelations[$relationKey]['types'] ?? [];
            if (! is_string($relationType) || ! in_array($relationType, $allowedTypes, true)) {
                $errors[$relationAttribute.'.relation_type'][] = 'The selected '.$relationAttribute.'.relation_type is invalid for this relation key.';

                continue;
            }

            if (! array_key_exists($relationType, $relationTypes)) {
                $errors[$relationAttribute.'.relation_type'][] = 'The selected '.$relationAttribute.'.relation_type is invalid.';

                continue;
            }

            if (! is_int($relationId)) {
                $errors[$relationAttribute.'.relation_id'][] = 'The '.$relationAttribute.'.relation_id field must be an integer.';

                continue;
            }

            $multiple = (bool) ($allowedRelations[$relationKey]['multiple'] ?? false);
            if (! $multiple) {
                $singleRelationCounts[$relationKey] = ($singleRelationCounts[$relationKey] ?? 0) + 1;
                if ($singleRelationCounts[$relationKey] > 1) {
                    $errors[$relationAttribute.'.relation_key'][] = 'The '.$relationAttribute.'.relation_key field may only have one relation.';
                }
            }

            $this->validateRelationExists(
                modelClass: $relationTypes[$relationType]['model'] ?? null,
                relationId: $relationId,
                attribute: $relationAttribute.'.relation_id',
                errors: $errors,
            );
        }
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    private function validateRelationExists(mixed $modelClass, int $relationId, string $attribute, array &$errors): void
    {
        if (! is_string($modelClass) || ! is_a($modelClass, Model::class, true)) {
            $errors[$attribute][] = 'The '.$attribute.' relation model is not configured.';

            return;
        }

        if (! $modelClass::query()->whereKey($relationId)->exists()) {
            $errors[$attribute][] = 'The selected '.$attribute.' is invalid.';
        }
    }

    /**
     * @param  array<string, list<string>>  $target
     * @param  array<string, array<int, string>>  $source
     */
    private function mergeErrors(array &$target, array $source): void
    {
        foreach ($source as $attribute => $messages) {
            foreach ($messages as $message) {
                $target[$attribute][] = $message;
            }
        }
    }

    /**
     * @param  array<string, list<string>>  $errors
     *
     * @throws ValidationException
     */
    private function throwIfInvalid(array $errors): void
    {
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }
}
