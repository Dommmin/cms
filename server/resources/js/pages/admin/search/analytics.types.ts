export interface TopQuery {
    query: string;
    count: number;
    avg_results: number;
}

export interface ZeroResultQuery {
    query: string;
    count: number;
}

export interface DailyVolume {
    date: string;
    count: number;
}

export interface AnalyticsStats {
    total_searches: number;
    unique_queries: number;
    zero_result_rate: number;
}

export interface AnalyticsProps {
    topQueries: TopQuery[];
    zeroResults: ZeroResultQuery[];
    dailyVolume: DailyVolume[];
    stats: AnalyticsStats;
    days: number;
}
