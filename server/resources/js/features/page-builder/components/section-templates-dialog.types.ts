import type { Block, Section } from '../types';

export type SectionTemplate = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    sections: Array<Omit<Section, 'id' | 'position'>>;
};
export type SectionTemplatesDialogProps = {
    open: boolean;
    onClose: () => void;
    onInsert: (template: SectionTemplate) => void;
};
