export type TriggerOption = {
    value: string;
    label: string;
};

export type AutomationFormData = {
    id?: number;
    name: string;
    trigger: string;
    subject: string;
    content: string;
    status: string;
};

export type CreatePageProps = {
    triggers: TriggerOption[];
};

export type EditPageProps = {
    automation: AutomationFormData;
    triggers: TriggerOption[];
};
