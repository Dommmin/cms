export interface CustomReport {
    id: number;
    name: string;
    description: string | null;
    data_source: string;
    metrics: string[];
    dimensions: string[] | null;
    filters: Record<string, unknown>[] | null;
    group_by: string[] | null;
    chart_type: 'table' | 'line' | 'bar' | 'pie' | null;
    is_public: boolean;
    user: { id: number; name: string } | null;
    created_at: string;
}

export interface IndexProps {
    reports: CustomReport[];
}
