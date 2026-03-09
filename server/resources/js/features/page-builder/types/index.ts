/**
 * Page Builder Types
 * Centralized type definitions following Single Responsibility Principle
 */

export type BlockRelation = {
    id?: number;
    relation_type: string;
    relation_id: number;
    relation_key: string | null;
    position: number;
    metadata: Record<string, unknown> | null;
};

export type Block = {
    id?: number;
    type: string;
    configuration: Record<string, unknown>;
    position: number;
    is_active: boolean;
    relations?: BlockRelation[];
    reusable_block_id?: number | null;
    reusable_block_name?: string | null;
};

export type Section = {
    id?: number;
    section_type: string;
    layout: string;
    variant: string | null;
    settings: Record<string, unknown> | null;
    position: number;
    is_active: boolean;
    blocks: Block[];
};

export type PageData = {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
};

export type AvailableSection = {
    label: string;
    description?: string;
    layouts?: string[] | Record<string, string>;
    variants?: string[] | Record<string, string>;
};

// Schema-driven field definitions for dynamic form generation

export type SchemaPropertyBase = {
    label?: string;
    description?: string;
    placeholder?: string;
    default?: unknown;
    required?: boolean;
};

export type StringSchemaProperty = SchemaPropertyBase & {
    type: 'string';
    format?: 'richtext' | 'textarea' | 'url' | 'color' | 'code';
    enum?: string[];
    maxLength?: number;
};

export type NumberSchemaProperty = SchemaPropertyBase & {
    type: 'integer' | 'number';
    min?: number;
    max?: number;
};

export type BooleanSchemaProperty = SchemaPropertyBase & {
    type: 'boolean';
};

export type ObjectSchemaProperty = SchemaPropertyBase & {
    type: 'object';
    properties: Record<string, SchemaProperty>;
};

export type ArraySchemaProperty = SchemaPropertyBase & {
    type: 'array';
    label: string;
    items: ObjectSchemaProperty;
};

export type SchemaProperty =
    | StringSchemaProperty
    | NumberSchemaProperty
    | BooleanSchemaProperty
    | ObjectSchemaProperty
    | ArraySchemaProperty;

export type BlockSchema = {
    type: 'object';
    properties: Record<string, SchemaProperty>;
};

export type RelationConfig = {
    types: string[];
    multiple: boolean;
};

export type BlockTypeConfig = {
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    allowed_relations?: Record<string, RelationConfig>;
    schema?: BlockSchema;
};

export type ReusableBlock = {
    id: number;
    name: string;
    description: string | null;
    type: string;
    configuration: Record<string, unknown>;
    relations_config: BlockRelation[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type BuilderData = {
    page: PageData;
    sections: Section[];
    available_sections: Record<string, AvailableSection>;
    available_block_relations: Record<string, BlockTypeConfig>;
};

export type SortableItemProps = {
    id: string;
    index: number;
};
