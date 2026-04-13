import type { CustomerSegment } from './index.types';

export interface SegmentRule {
    field: string;
    operator: string;
    value: string;
}

export interface SegmentFormData {
    name: string;
    description: string;
    type: 'manual' | 'dynamic';
    rules: SegmentRule[];
    is_active: boolean;
}

export interface FormProps {
    segment?: CustomerSegment;
}
