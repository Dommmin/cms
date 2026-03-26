import type { AdminPreviewEntity } from '@/hooks/use-admin-preview';

export interface AdminBarProps {
  entity?: {
    type: AdminPreviewEntity['type'];
    id: number | null;
    name: string | null;
    admin_url: string | null;
  } | null;
}
