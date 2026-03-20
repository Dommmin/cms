"use client";

import { motion } from "framer-motion";

type AnimationPreset = {
  initial: Record<string, number>;
  animate: Record<string, number>;
};

const PRESETS: Record<string, AnimationPreset> = {
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  "fade-up": {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
  },
  "fade-left": {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
  },
  "fade-right": {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
  },
  "zoom-in": {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
  },
};

interface Props {
  animation: string;
  className?: string;
  "data-section-type"?: string;
  "data-section-id"?: number;
  children: React.ReactNode;
}

export function AnimatedSection({ animation, className, children, ...rest }: Props) {
  const preset = PRESETS[animation];

  if (!preset) {
    return (
      <section className={className} {...rest}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      className={className}
      initial={preset.initial}
      whileInView={preset.animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
