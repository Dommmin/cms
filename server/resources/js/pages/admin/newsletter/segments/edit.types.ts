export type Segment = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    campaigns_count: number;
};
export type EditProps = {
    segment: Segment;
};
