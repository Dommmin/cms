export type CannedResponse = {
    id: number;
    title: string;
    shortcut: string;
    body: string;
    created_at: string;
};
export type CannedResponsesData = {
    data: CannedResponse[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = { canned_responses: CannedResponsesData };
