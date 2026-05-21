import type { PageHealthIssue, PageHealthSummary } from '../page-health.types';

export type PageHealthPanelProps = {
    issues: PageHealthIssue[];
    summary: PageHealthSummary;
};
