export type AutomationCampaign = {
    id: number;
    name: string;
    trigger: string | null;
    trigger_label: string | null;
    status: string;
    status_label: string;
    total_sent: number;
    sends_count: number;
    scheduled_at: string | null;
    created_at: string;
};

export type IndexProps = {
    campaigns: AutomationCampaign[];
};
