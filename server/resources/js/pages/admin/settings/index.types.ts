export type Setting = {
    key: string;
    label: string | null;
    value: unknown;
    type: string;
    description: string | null;
    is_public: boolean;
};
export type IndexProps = {
    settings: { data: Setting[] };
    groups: string[];
    currentGroup: string;
};
