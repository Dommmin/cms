import type { MenuItem } from '@/types/api';

export interface FooterContentProps {
    mainItems: MenuItem[];
    legalItems: MenuItem[];
    currentYear: number;
}
