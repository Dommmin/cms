import type { Form, PageBlock } from '@/types/api';

export interface FormEmbedConfig {
  title?: string;
  subtitle?: string;
  /** Pre-resolved form data embedded by the API */
  form?: Form;
}
export interface FormEmbedProps {
  block: PageBlock;
}
