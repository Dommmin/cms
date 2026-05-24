/**
 * Dynamic Block Form
 * Renders form fields from a block's JSON schema (config/blocks.php).
 * Developers define a block in config - no frontend changes needed.
 */

import { useTranslation } from '@/hooks/use-translation';
import { RelationSection } from './dynamic-block-form/relation-section';
import {
    getRelationKeys,
    pickAllowedRelations,
    toBlockRelations,
    toRelationsData,
} from './dynamic-block-form/relations';
import { SchemaField } from './dynamic-block-form/schema-field';
import type {
    DynamicBlockFormProps,
    RelationSectionProps,
} from './dynamic-block-form.types';

const simpleModeFieldKeys = new Set([
    'title',
    'heading',
    'subtitle',
    'description',
    'content',
    'primary_label',
    'secondary_label',
    'primary_url',
    'secondary_url',
    'cta_text',
    'cta_url',
    'cta2_text',
    'cta2_url',
    'button_text',
    'button_url',
]);

export function DynamicBlockForm({
    block,
    blockTypeConfig,
    onUpdateConfig,
    onUpdateRelations,
    editorMode,
}: DynamicBlockFormProps) {
    const __ = useTranslation();
    const schema = blockTypeConfig.schema;
    const properties = schema?.properties ?? {};
    const allowedRelations = blockTypeConfig.allowed_relations ?? {};
    const mediaRelationKeys = getRelationKeys(allowedRelations, 'media');
    const nonMediaRelationKeys = getRelationKeys(allowedRelations, 'non-media');
    const relationsData = toRelationsData(block.relations);

    const updateConfigField = (key: string, value: unknown) => {
        onUpdateConfig({ ...block.configuration, [key]: value });
    };

    const hasSchemaFields = Object.keys(properties).length > 0;
    const visibleProperties =
        editorMode === 'simple'
            ? Object.fromEntries(
                  Object.entries(properties).filter(([key]) =>
                      simpleModeFieldKeys.has(key),
                  ),
              )
            : properties;
    const hasVisibleSchemaFields = Object.keys(visibleProperties).length > 0;
    const hasNonMediaRelations = nonMediaRelationKeys.length > 0;

    return (
        <div className="space-y-5">
            {hasVisibleSchemaFields && (
                <div className="space-y-4">
                    {Object.entries(visibleProperties).map(
                        ([key, propSchema]) => (
                            <SchemaField
                                key={key}
                                fieldKey={key}
                                schema={propSchema}
                                value={block.configuration[key]}
                                onChange={(v) => updateConfigField(key, v)}
                                blockType={block.type}
                            />
                        ),
                    )}
                </div>
            )}

            {mediaRelationKeys.length > 0 && (
                <RelationSection
                    title={__('builder.media', 'Media')}
                    blockType={block.type}
                    allowedRelations={
                        pickAllowedRelations(
                            mediaRelationKeys,
                            allowedRelations,
                        ) as RelationSectionProps['allowedRelations']
                    }
                    value={relationsData}
                    onChange={(relations) =>
                        onUpdateRelations(toBlockRelations(relations))
                    }
                />
            )}

            {editorMode === 'advanced' && hasNonMediaRelations && (
                <RelationSection
                    title={__('builder.linked_content', 'Linked Content')}
                    blockType={block.type}
                    allowedRelations={
                        pickAllowedRelations(
                            nonMediaRelationKeys,
                            allowedRelations,
                        ) as RelationSectionProps['allowedRelations']
                    }
                    value={relationsData}
                    onChange={(relations) =>
                        onUpdateRelations(toBlockRelations(relations))
                    }
                />
            )}

            {!hasSchemaFields && Object.keys(allowedRelations).length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    {__(
                        'builder.no_configurable_fields',
                        'No configurable fields for this block type.',
                    )}
                </div>
            )}
        </div>
    );
}
