import type { Product, ProductAttributeValue } from '@/types/api';

export interface ProductAttributeBooleanLabels {
    falseLabel: string;
    trueLabel: string;
}

export interface ProductSpecificationEntry {
    label: string;
    slug: string;
    values: string[];
}

export interface ProductSummaryEntry {
    label: string;
    values: string[];
}

const DEFAULT_BOOLEAN_LABELS: ProductAttributeBooleanLabels = {
    trueLabel: 'Yes',
    falseLabel: 'No',
};

export function getVariantAttributeGroups(
    product: Product,
): [string, string[]][] {
    if (product.variant_options && product.variant_options.length > 0) {
        return product.variant_options.map((option) => [
            option.label,
            option.values,
        ]);
    }

    return Object.entries(
        (product.variants ?? []).reduce<Record<string, string[]>>(
            (accumulator, variant) => {
                Object.entries(variant.attributes).forEach(
                    ([attributeName, value]) => {
                        if (!accumulator[attributeName]) {
                            accumulator[attributeName] = [];
                        }

                        if (!accumulator[attributeName].includes(value)) {
                            accumulator[attributeName].push(value);
                        }
                    },
                );

                return accumulator;
            },
            {},
        ),
    );
}

export function getProductSpecificationEntries(
    product: Product,
    labels: ProductAttributeBooleanLabels = DEFAULT_BOOLEAN_LABELS,
): ProductSpecificationEntry[] {
    const variantOptionLabels = new Set(
        (product.variant_options ?? []).map((option) => option.label),
    );
    const variantOptionSlugs = new Set(
        (product.variant_options ?? []).map((option) => option.slug),
    );

    return (product.attribute_values ?? [])
        .filter(
            (attribute) =>
                !variantOptionLabels.has(attribute.label) &&
                !variantOptionSlugs.has(attribute.slug),
        )
        .map((attribute) => ({
            slug: attribute.slug,
            label: attribute.label,
            values: normalizeAttributeDisplayValue(attribute, labels),
        }))
        .filter((entry) => entry.values.length > 0);
}

export function getListingAttributeEntries(
    product: Product,
    labels: ProductAttributeBooleanLabels = DEFAULT_BOOLEAN_LABELS,
): ProductSummaryEntry[] {
    const summaryEntries = Object.values(product.attribute_summary ?? {})
        .map((entry) => ({
            label: entry.label,
            values: normalizeValues(entry.value, labels),
        }))
        .filter((entry) => entry.values.length > 0);

    if (summaryEntries.length > 0) {
        return summaryEntries;
    }

    return Object.entries(product.attribute_map ?? {})
        .map(([label, values]) => ({
            label,
            values: values.flatMap((value) => normalizeValues(value, labels)),
        }))
        .filter((entry) => entry.values.length > 0);
}

function normalizeAttributeDisplayValue(
    attribute: ProductAttributeValue,
    labels: ProductAttributeBooleanLabels,
): string[] {
    return normalizeValues(attribute.display_value, labels);
}

function normalizeValues(
    value: boolean | number | string | null | string[],
    labels: ProductAttributeBooleanLabels,
): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeValues(item, labels));
    }

    if (typeof value === 'boolean') {
        return [value ? labels.trueLabel : labels.falseLabel];
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (trimmedValue === '') {
            return [];
        }

        if (trimmedValue === 'true') {
            return [labels.trueLabel];
        }

        if (trimmedValue === 'false') {
            return [labels.falseLabel];
        }

        return [trimmedValue];
    }

    if (typeof value === 'number') {
        return [String(value)];
    }

    return [];
}
