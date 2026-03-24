export type VersionEntry = {
    id: number;
    version_number: number;
    event: 'created' | 'updated' | 'deleted' | 'restored';
    changes: Record<string, { old: unknown; new: unknown }> | null;
    change_note: string | null;
    created_at: string;
    creator: { id: number; name: string } | null;
};
export type DiffEntry = { old: unknown; new: unknown };
export type VersionHistoryProps = {
    modelType: string;
    modelId: number;
};
