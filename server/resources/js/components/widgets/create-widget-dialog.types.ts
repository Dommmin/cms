export interface FormData {
    title: string;
    type: string;
    size: string;
    icon: string;
    color: string;
    // stat
    stat_model: string;
    stat_query: string;
    stat_field: string;
    stat_format: string;
    stat_trend: boolean;
    stat_period: string;
    // chart
    chart_type: string;
    // table
    table_source: string;
    table_model: string;
    table_limit: string;
    table_threshold: string;
    [key: string]: string | boolean;
}
