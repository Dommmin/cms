import type { User } from '@/types/auth';

export type UserData = {
    data: User[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    sort?: string;
};
