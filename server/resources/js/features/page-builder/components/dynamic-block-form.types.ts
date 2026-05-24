import type { ReactNode } from 'react';
import type {
    RelationConfig as BRMRelationConfig,
    Relation,
} from '@/components/admin/block-relation-manager';
import type {
    Block,
    BlockTypeConfig,
    EditorMode,
    SchemaProperty,
} from '../types';

export type FieldProps = {
    fieldKey: string;
    schema: SchemaProperty;
    value: unknown;
    onChange: (value: unknown) => void;
    blockType?: string;
};

export type RepeaterFieldProps = FieldProps & {
    renderField: (props: FieldProps) => ReactNode;
};

export type DynamicBlockFormProps = {
    block: Block;
    blockTypeConfig: BlockTypeConfig;
    onUpdateConfig: (config: Record<string, unknown>) => void;
    onUpdateRelations: (relations: Block['relations']) => void;
    editorMode: EditorMode;
};

export type RelationsData = Record<string, Relation | Relation[]>;

export type RelationSectionProps = {
    title: string;
    blockType: string;
    allowedRelations: Record<string, BRMRelationConfig>;
    value: RelationsData;
    onChange: (relations: RelationsData) => void;
};
