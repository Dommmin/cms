import type { PageSection } from '@/types/api';

export interface SectionRendererProps {
  section: PageSection;
  isPreview?: boolean;
  pageId?: number;
  adminBaseUrl?: string;
}
