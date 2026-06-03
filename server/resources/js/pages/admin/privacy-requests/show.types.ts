export type PrivacyRequestUser = {
    id: number;
    name: string;
    email: string;
} | null;

export type PrivacyRequest = {
    id: number;
    type: string;
    status: string;
    email: string | null;
    payload: Record<string, unknown> | null;
    resolution_note: string | null;
    requested_at: string | null;
    resolved_at: string | null;
    user: PrivacyRequestUser;
    processed_by_user: PrivacyRequestUser;
};

export type ShowProps = {
    privacyRequest: PrivacyRequest;
};
