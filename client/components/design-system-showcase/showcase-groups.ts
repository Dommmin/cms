export const DESIGN_SYSTEM_SHOWCASE_SLUG = 'design-system-showcase';

export const DESIGN_SYSTEM_SHOWCASE_GROUPS = [
    'typography',
    'containers',
    'sections',
    'stack_layouts',
    'grid_layouts',
    'surfaces',
    'buttons',
    'cards',
    'forms',
    'badges',
    'alerts',
    'prose',
    'colors',
    'spacing',
    'responsive',
] as const;

export type DesignSystemShowcaseGroup =
    (typeof DESIGN_SYSTEM_SHOWCASE_GROUPS)[number];

/** Number of visual examples per group — kept in sync with the seeder summary. */
export const SHOWCASE_EXAMPLE_COUNTS: Record<
    DesignSystemShowcaseGroup,
    number
> = {
    typography: 12,
    containers: 4,
    sections: 5,
    stack_layouts: 5,
    grid_layouts: 4,
    surfaces: 4,
    buttons: 15,
    cards: 4,
    forms: 6,
    badges: 4,
    alerts: 4,
    prose: 1,
    colors: 28,
    spacing: 7,
    responsive: 3,
};

export const TOTAL_SHOWCASE_EXAMPLES = Object.values(
    SHOWCASE_EXAMPLE_COUNTS,
).reduce((sum, count) => sum + count, 0);

export const GROUP_LABELS: Record<DesignSystemShowcaseGroup, string> = {
    typography: 'Typography',
    containers: 'Containers',
    sections: 'Sections',
    stack_layouts: 'Stack Layouts',
    grid_layouts: 'Grid Layouts',
    surfaces: 'Surfaces',
    buttons: 'Buttons',
    cards: 'Cards',
    forms: 'Forms',
    badges: 'Badges',
    alerts: 'Alerts',
    prose: 'Prose Content',
    colors: 'Colors',
    spacing: 'Spacing',
    responsive: 'Responsive Examples',
};
