export type AnimationPreset = {
  initial: Record<string, number>;
  animate: Record<string, number>;
};
export interface AnimatedSectionProps {
  animation: string;
  className?: string;
  'data-section-type'?: string;
  'data-section-id'?: number;
  children: React.ReactNode;
}
