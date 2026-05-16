import type { Relation } from '@/components/admin/block-relation-manager';
import type { Block, RelationConfig } from '../../types';
import type { RelationsData } from '../dynamic-block-form.types';

export function getRelationKeys(
    allowedRelations: Record<string, RelationConfig>,
    mode: 'media' | 'non-media',
): string[] {
    return Object.keys(allowedRelations).filter((key) => {
        const isMedia = allowedRelations[key].types.some((type) =>
            type.startsWith('media.'),
        );

        return mode === 'media' ? isMedia : !isMedia;
    });
}

export function pickAllowedRelations(
    keys: string[],
    allowedRelations: Record<string, RelationConfig>,
): Record<string, RelationConfig> {
    return Object.fromEntries(keys.map((key) => [key, allowedRelations[key]]));
}

export function toRelationsData(relations: Block['relations']): RelationsData {
    const relationsData: RelationsData = {};

    relations?.forEach((rel) => {
        const key = rel.relation_key ?? rel.relation_type;
        const relationData: Relation = {
            type: rel.relation_type as Relation['type'],
            id: rel.relation_id,
            metadata: rel.metadata ?? undefined,
        };

        if (!relationsData[key]) {
            relationsData[key] = relationData;
            return;
        }

        if (Array.isArray(relationsData[key])) {
            (relationsData[key] as Relation[]).push(relationData);
            return;
        }

        relationsData[key] = [relationsData[key] as Relation, relationData];
    });

    return relationsData;
}

export function toBlockRelations(
    newRelations: RelationsData,
): Block['relations'] {
    const blockRelations: Block['relations'] = [];
    let position = 0;

    Object.entries(newRelations).forEach(([key, data]) => {
        const items = Array.isArray(data) ? data : [data];

        items.forEach((item) => {
            blockRelations.push({
                relation_type: item.type,
                relation_id: item.id,
                relation_key: key,
                position: position++,
                metadata: item.metadata ?? null,
            });
        });
    });

    return blockRelations;
}
