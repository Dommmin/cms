<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttributeDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->definitions() as $position => $definition) {
            $attribute = Attribute::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'name' => $definition['name'],
                    'type' => $definition['type'],
                    'unit' => $definition['unit'] ?? null,
                    'is_filterable' => $definition['is_filterable'] ?? false,
                    'is_variant_selection' => $definition['is_variant_selection'] ?? false,
                    'position' => $position + 1,
                ],
            );

            foreach ($definition['options'] ?? [] as $optionPosition => $option) {
                AttributeValue::query()->updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'slug' => $option['slug'],
                    ],
                    [
                        'value' => $option['value'],
                        'color_hex' => $option['color_hex'] ?? null,
                        'position' => $optionPosition + 1,
                    ],
                );
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function definitions(): array
    {
        return [
            $this->text('material', 'Material'),
            $this->text('country_of_origin', 'Country of Origin'),
            $this->text('compatibility', 'Compatibility'),
            $this->numeric('capacity_ml', 'Capacity', 'ml'),
            $this->numeric('weight_g', 'Weight', 'g'),
            $this->numeric('power_w', 'Power', 'W'),
            $this->numeric('spf', 'SPF'),
            $this->numeric('screen_size', 'Screen Size', 'in'),
            $this->numeric('memory_gb', 'Memory', 'GB'),
            $this->numeric('storage_gb', 'Storage', 'GB'),
            $this->boolean('waterproof', 'Waterproof'),
            $this->boolean('vegan', 'Vegan'),
            $this->boolean('wireless', 'Wireless'),
            $this->boolean('organic', 'Organic'),
            $this->select('skin_type', 'Skin Type', ['dry', 'sensitive', 'normal', 'combination'], isFilterable: true),
            $this->color('color', 'Color', [
                ['value' => 'Black', 'slug' => 'black', 'color_hex' => '#111827'],
                ['value' => 'White', 'slug' => 'white', 'color_hex' => '#F8FAFC'],
                ['value' => 'Beige', 'slug' => 'beige', 'color_hex' => '#D4B896'],
                ['value' => 'Blue', 'slug' => 'blue', 'color_hex' => '#2563EB'],
                ['value' => 'Green', 'slug' => 'green', 'color_hex' => '#15803D'],
            ], isVariantSelection: true),
            $this->select('size', 'Size', ['S', 'M', 'L', 'XL'], isFilterable: true, isVariantSelection: true),
            $this->select('gender', 'Gender', ['women', 'men', 'unisex']),
            $this->select('connector_type', 'Connector Type', ['usb-c', 'lightning', 'bluetooth'], isFilterable: true),
            $this->multiselect('active_ingredients', 'Active Ingredients', ['vitamin-c', 'hyaluronic-acid', 'ceramides', 'niacinamide']),
            $this->multiselect('features', 'Features', ['anc', 'fast-charging', 'organic-cotton', 'wireless-charging', 'water-resistant']),
            $this->multiselect('supported_devices', 'Supported Devices', ['iphone', 'android', 'tablets', 'usb-c-laptops']),
            $this->select('volume', 'Volume', ['50-ml', '100-ml', '250-ml'], isFilterable: true, isVariantSelection: true),
            $this->select('edition', 'Edition', ['standard', 'pro'], isFilterable: true, isVariantSelection: true),
            $this->date('release_date', 'Release Date'),
            $this->date('valid_until', 'Valid Until'),
        ];
    }

    /**
     * @param  list<string>  $values
     * @return array<string, mixed>
     */
    private function select(
        string $slug,
        string $name,
        array $values,
        bool $isFilterable = false,
        bool $isVariantSelection = false,
    ): array {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::SELECT,
            'is_filterable' => $isFilterable,
            'is_variant_selection' => $isVariantSelection,
            'options' => collect($values)
                ->map(fn (string $value): array => [
                    'value' => Str::of($value)->replace('-', ' ')->title()->toString(),
                    'slug' => Str::slug($value),
                ])
                ->all(),
        ];
    }

    /**
     * @param  list<string>  $values
     * @return array<string, mixed>
     */
    private function multiselect(string $slug, string $name, array $values): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::MULTISELECT,
            'options' => collect($values)
                ->map(fn (string $value): array => [
                    'value' => Str::of($value)->replace('-', ' ')->title()->toString(),
                    'slug' => Str::slug($value),
                ])
                ->all(),
        ];
    }

    /**
     * @param  list<array{value: string, slug: string, color_hex: string}>  $values
     * @return array<string, mixed>
     */
    private function color(
        string $slug,
        string $name,
        array $values,
        bool $isVariantSelection = false,
    ): array {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::COLOR,
            'is_filterable' => true,
            'is_variant_selection' => $isVariantSelection,
            'options' => $values,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function text(string $slug, string $name): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::TEXT,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function numeric(string $slug, string $name, ?string $unit = null): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::NUMERIC,
            'unit' => $unit,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function boolean(string $slug, string $name): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::BOOLEAN,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function date(string $slug, string $name): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'type' => AttributeTypeEnum::DATE,
        ];
    }
}
