import type { EmailTemplate } from './index.types';

export interface EditProps {
    template: EmailTemplate & { body: string };
}
