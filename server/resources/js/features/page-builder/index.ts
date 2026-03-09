/**
 * Page Builder Feature
 * Main export file following barrel pattern
 */

// Main component
export { PageBuilder } from './components/page-builder';

// Types
export type * from './types';

// Individual components (if needed elsewhere)
export { SectionCard } from './components/section-card';
export { BlockCard } from './components/block-card';
export { SectionForm } from './components/section-form';
export { BlockForm } from './components/block-form';
export { BuilderToolbar } from './components/builder-toolbar';
export type { PreviewDevice } from './components/builder-toolbar';

// Hooks
export { useBuilderState } from './hooks/use-builder-state';
