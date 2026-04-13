import type { CustomReport } from './index.types';

export interface ReportResults {
    data: Record<string, unknown>[];
    columns: string[];
    summary: Record<string, unknown>;
}

export interface ShowProps {
    report: CustomReport;
    results: ReportResults;
}
