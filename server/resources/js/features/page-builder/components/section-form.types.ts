import type { AvailableSection, Section } from '../types';

export type SectionFormProps = {
    section: Section;
    availableSections: Record<string, AvailableSection>;
    onUpdate: (patch: Partial<Section>) => void;
};
