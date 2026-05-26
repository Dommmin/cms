import { GlassView } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Storefront } from '@/constants/theme';

interface GlassSurfaceProps {
  children: ReactNode;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassSurface({ children, interactive = false, style }: GlassSurfaceProps) {
  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme="light"
      isInteractive={interactive}
      tintColor={Storefront.colors.glassTint}
      style={[styles.surface, style]}>
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    borderColor: Storefront.colors.glassBorder,
    backgroundColor: Storefront.colors.glass,
    ...Storefront.shadow.glass,
  },
});
