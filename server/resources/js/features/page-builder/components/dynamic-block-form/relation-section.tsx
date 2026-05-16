import { BlockRelationManager } from '@/components/admin/block-relation-manager';
import type { RelationSectionProps } from '../dynamic-block-form.types';

export function RelationSection({
    title,
    blockType,
    allowedRelations,
    value,
    onChange,
}: RelationSectionProps) {
    return (
        <div className="space-y-2">
            <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                    {title}
                </p>
                <BlockRelationManager
                    blockType={blockType}
                    allowedRelations={allowedRelations}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
