import type { Block } from '../types';

export type InlineEditableField =
    | 'title'
    | 'heading'
    | 'subtitle'
    | 'description'
    | 'primary_label'
    | 'secondary_label';

export type CanvasBlockPreviewProps = {
    block: Block;
    onInlineEdit: (field: InlineEditableField, value: string) => void;
};

export type EditableTextProps = {
    as: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    field: InlineEditableField;
    value: unknown;
    className?: string;
    placeholder: string;
    onInlineEdit: (field: InlineEditableField, value: string) => void;
};

export type InlineButtonProps = {
    field: 'primary_label' | 'secondary_label';
    value: unknown;
    onInlineEdit: (field: InlineEditableField, value: string) => void;
};
