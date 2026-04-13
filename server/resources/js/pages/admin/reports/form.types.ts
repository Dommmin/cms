import type { CustomReport } from './index.types';

export interface ReportFormData {
    name: string;
    description: string;
    data_source: string;
    metrics: string[];
    dimensions: string[];
    filters: unknown[];
    group_by: string[];
    chart_type: string;
    is_public: boolean;
}

export interface AvailableMetric {
    key: string;
    label: string;
}

export interface AvailableDataSource {
    key: string;
    label: string;
}

export interface FormProps {
    report?: CustomReport;
    dataSources: AvailableDataSource[];
    metrics: AvailableMetric[];
}
