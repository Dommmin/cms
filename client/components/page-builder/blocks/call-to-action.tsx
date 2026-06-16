import { CTASection } from '@/components/composition';

import { getRelationsByKey } from '@/lib/format';
import type {
    CallToActionConfig,
    CallToActionProps,
} from './call-to-action.types';

export function CallToActionBlock({ block }: CallToActionProps) {
    const cfg = block.configuration as CallToActionConfig;
    const bgMedia = getRelationsByKey(block.relations, 'background')[0];
    const bgImageUrl = bgMedia?.metadata?.url as string | undefined;

    return (
        <CTASection
            title={cfg.title}
            description={cfg.subtitle}
            primaryLabel={cfg.primary_label}
            primaryHref={cfg.primary_url}
            secondaryLabel={cfg.secondary_label}
            secondaryHref={cfg.secondary_url}
            style={cfg.style ?? 'gradient'}
            align={cfg.alignment ?? 'center'}
            badge={cfg.badge_text}
            backgroundImageUrl={bgImageUrl}
        />
    );
}
