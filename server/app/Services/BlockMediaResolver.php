<?php

declare(strict_types=1);

namespace App\Services;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Resolves media_id in block configuration to URLs for API responses.
 */
class BlockMediaResolver
{
    /**
     * Resolve media IDs to URLs in block configuration.
     * Uses config/cms/sections to determine which fields are media (type: image, file-upload).
     *
     * @param  array<string, mixed>  $configuration
     * @return array<string, mixed>
     */
    public function resolveInConfiguration(array $configuration, string $blockType): array
    {
        $sectionConfig = config('cms.sections.'.$blockType);
        if (! is_array($sectionConfig)) {
            return $configuration;
        }

        return $this->resolveWithConfig($configuration, $sectionConfig);
    }

    /**
     * @param  array<string, mixed>  $configuration
     * @param  array<string, mixed>  $sectionConfig
     * @return array<string, mixed>
     */
    public function resolveWithConfig(array $configuration, array $sectionConfig): array
    {
        $mediaFields = $this->getMediaFieldNames($sectionConfig);
        if ($mediaFields === []) {
            return $configuration;
        }

        return $this->resolveRecursive($configuration, $mediaFields, '');
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>  $mediaFields
     * @return array<string, mixed>
     */
    private function resolveRecursive(array $data, array $mediaFields, string $path): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            $fullPath = $path !== '' && $path !== '0' ? sprintf('%s.%s', $path, $key) : $key;
            if (is_array($value) && ! $this->isListOfMediaIds($value)) {
                $result[$key] = $this->resolveRecursive($value, $mediaFields, $fullPath);
            } elseif (in_array($key, $mediaFields, true) && is_array($value)) {
                $result[$key] = array_map(fn ($id): ?string => is_numeric($id) ? $this->resolveMediaId((int) $id) : null, $value);
            } elseif (in_array($key, $mediaFields, true) && is_numeric($value)) {
                $result[$key] = $this->resolveMediaId((int) $value);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    private function resolveMediaId(int $mediaId): ?string
    {
        $media = Media::query()->find($mediaId);

        return $media?->getUrl() ?? null;
    }

    /**
     * Detect if value is a list of media IDs (e.g. [1, 2, 3] for image_gallery.images).
     *
     * @param  array<int, mixed>  $value
     */
    private function isListOfMediaIds(array $value): bool
    {
        if ($value === []) {
            return false;
        }

        $keys = array_keys($value);
        if ($keys !== range(0, count($value) - 1)) {
            return false;
        }

        return array_all($value, fn ($v): bool => is_numeric($v));
    }

    /**
     * @return array<int, string>
     */
    private function getMediaFieldNames(array $sectionConfig): array
    {
        $names = [];
        $this->collectMediaFields($sectionConfig['fields'] ?? [], $names, '');

        return $names;
    }

    /**
     * @param  array<int, mixed>  $fields
     * @param  array<int, string>  $names
     */
    private function collectMediaFields(array $fields, array &$names, string $prefix): void
    {
        foreach ($fields as $field) {
            if (! is_array($field)) {
                continue;
            }

            if (empty($field['name'])) {
                continue;
            }

            $name = $field['name'];
            $fullName = $prefix !== '' && $prefix !== '0' ? sprintf('%s.%s', $prefix, $name) : $name;
            if (in_array($field['type'] ?? '', ['image', 'file-upload'], true)) {
                $names[] = $name;
            }

            if (isset($field['fields']) && is_array($field['fields'])) {
                $this->collectMediaFields($field['fields'], $names, $fullName);
            }
        }
    }
}
