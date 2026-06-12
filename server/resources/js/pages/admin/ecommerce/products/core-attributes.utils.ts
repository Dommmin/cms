import type {
    CoreAttributeSchemaItem,
    ProductAttributeFormValue,
} from './core-attributes.types';

export function getCategoryAttributeSchema(
    categories: Array<{
        id: number;
        attribute_schema?: CoreAttributeSchemaItem[];
    }>,
    categoryId: number | string | null,
): CoreAttributeSchemaItem[] {
    if (categoryId === null || categoryId === '') {
        return [];
    }

    const resolvedCategoryId = Number(categoryId);

    return (
        categories.find((category) => category.id === resolvedCategoryId)
            ?.attribute_schema ?? []
    );
}

export function alignAttributeValuesToSchema(
    schema: CoreAttributeSchemaItem[],
    values: ProductAttributeFormValue[],
): ProductAttributeFormValue[] {
    return schema.map((attribute) => {
        const currentValue = values.find(
            (value) => value.attribute_id === attribute.attribute_id,
        );

        return {
            attribute_id: attribute.attribute_id,
            value: currentValue?.value ?? '',
            option_id: currentValue?.option_id ?? null,
            option_ids: currentValue?.option_ids ?? [],
        };
    });
}
