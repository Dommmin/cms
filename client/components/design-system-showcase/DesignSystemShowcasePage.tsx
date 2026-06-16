'use client';

import type { ComponentType } from 'react';

import { PageHeader } from '@/components/composition/PageHeader';
import { Section } from '@/components/composition/Section';

import type { DesignSystemShowcasePageProps } from './DesignSystemShowcasePage.types';
import { AlertsShowcase } from './groups/AlertsShowcase';
import { BadgesShowcase } from './groups/BadgesShowcase';
import { ButtonsShowcase } from './groups/ButtonsShowcase';
import { CardsShowcase } from './groups/CardsShowcase';
import { ColorsShowcase } from './groups/ColorsShowcase';
import { ContainersShowcase } from './groups/ContainersShowcase';
import { FormsShowcase } from './groups/FormsShowcase';
import { GridLayoutsShowcase } from './groups/GridLayoutsShowcase';
import { ProseShowcase } from './groups/ProseShowcase';
import { ResponsiveShowcase } from './groups/ResponsiveShowcase';
import { SectionsShowcase } from './groups/SectionsShowcase';
import { SpacingShowcase } from './groups/SpacingShowcase';
import { StackLayoutsShowcase } from './groups/StackLayoutsShowcase';
import { SurfacesShowcase } from './groups/SurfacesShowcase';
import { TypographyShowcase } from './groups/TypographyShowcase';
import {
    DESIGN_SYSTEM_SHOWCASE_GROUPS,
    GROUP_LABELS,
    type DesignSystemShowcaseGroup,
} from './showcase-groups';

const GROUP_COMPONENTS: Record<DesignSystemShowcaseGroup, ComponentType> = {
    typography: TypographyShowcase,
    containers: ContainersShowcase,
    sections: SectionsShowcase,
    stack_layouts: StackLayoutsShowcase,
    grid_layouts: GridLayoutsShowcase,
    surfaces: SurfacesShowcase,
    buttons: ButtonsShowcase,
    cards: CardsShowcase,
    forms: FormsShowcase,
    badges: BadgesShowcase,
    alerts: AlertsShowcase,
    prose: ProseShowcase,
    colors: ColorsShowcase,
    spacing: SpacingShowcase,
    responsive: ResponsiveShowcase,
};

function resolveGroups(
    sections: DesignSystemShowcasePageProps['sections'],
): DesignSystemShowcaseGroup[] {
    const fromSections = sections
        .filter((section) => section.is_active)
        .sort((a, b) => a.position - b.position)
        .map((section) => {
            const settings = section.settings as Record<string, unknown> | null;
            const group = settings?.showcase_group;

            return typeof group === 'string' ? group : null;
        })
        .filter((group): group is DesignSystemShowcaseGroup =>
            DESIGN_SYSTEM_SHOWCASE_GROUPS.includes(
                group as DesignSystemShowcaseGroup,
            ),
        );

    if (fromSections.length > 0) {
        return fromSections;
    }

    return [...DESIGN_SYSTEM_SHOWCASE_GROUPS];
}

export function DesignSystemShowcasePage({
    sections,
}: DesignSystemShowcasePageProps) {
    const groups = resolveGroups(sections);

    return (
        <>
            <Section variant="light" padding="xl" id="design-system-showcase">
                <PageHeader
                    title="Design System Showcase"
                    description="Visual documentation of base storefront components — composition primitives, UI controls, and design tokens. Independent of page builder blocks and theme token previews."
                    eyebrow="Reference"
                />
            </Section>
            {groups.map((group) => {
                const Component = GROUP_COMPONENTS[group];

                return (
                    <Section
                        key={group}
                        id={group.replace(/_/g, '-')}
                        variant={group === 'sections' ? 'muted' : 'light'}
                        padding="lg"
                    >
                        <Component />
                        <p className="text-muted-foreground sr-only">
                            {GROUP_LABELS[group]}
                        </p>
                    </Section>
                );
            })}
        </>
    );
}
