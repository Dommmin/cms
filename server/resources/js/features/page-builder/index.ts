/**
 * Page Builder Feature
 * Main export file following barrel pattern
 */

// Main component
export { PageBuilder } from './components/page-builder';

// Types
export type * from './types';

// Individual components (if needed elsewhere)
export { BlockCard } from './components/block-card';
export { BlockForm } from './components/block-form';
export { BuilderToolbar } from './components/builder-toolbar';
export type { ApprovalStatus } from './components/builder-toolbar.types';
export { SectionCard } from './components/section-card';
export { SectionForm } from './components/section-form';

// Hooks
export { useBuilderState } from './hooks/use-builder-state';
