import type { Section } from './types';

export type PageHealthSeverity = 'error' | 'warning';

export type PageHealthIssue = {
    id: string;
    severity: PageHealthSeverity;
    title: string;
    description: string;
    location?: string;
};

export type PageHealthSummary = {
    h1Count: number;
    activeBlockCount: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
};

export type PageHealthResult = {
    issues: PageHealthIssue[];
    summary: PageHealthSummary;
};

export type AnalyzePageHealthOptions = {
    sections: Section[];
    blockLabels?: Record<string, string>;
};
