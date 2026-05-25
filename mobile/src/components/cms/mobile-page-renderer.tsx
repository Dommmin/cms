import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ProductCard } from '@/components/product/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { stripHtml } from '@/lib/format';
import type { Page, PageBlock, Product } from '@/types/api';

export function MobilePageRenderer({ page }: { page: Page }) {
  return (
    <ThemedView style={styles.wrapper}>
      {page.content ? (
        <ThemedView style={styles.panel}>
          <ThemedText>{stripHtml(page.content)}</ThemedText>
        </ThemedView>
      ) : null}
      {page.sections
        .filter((section) => section.is_active)
        .sort((a, b) => a.position - b.position)
        .map((section) => (
          <ThemedView key={section.id} style={[styles.section, section.variant === 'dark' && styles.darkSection]}>
            {section.blocks
              .filter((block) => block.is_active)
              .sort((a, b) => a.position - b.position)
              .map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
          </ThemedView>
        ))}
    </ThemedView>
  );
}

function BlockRenderer({ block }: { block: PageBlock }) {
  const config = block.configuration;
  const title = getString(config.title) ?? getString(config.heading);
  const body = getString(config.description) ?? getString(config.text) ?? getString(config.content);

  if (block.type === 'hero_banner' || block.type === 'call_to_action' || block.type === 'promotional_banner') {
    return (
      <ThemedView style={styles.hero}>
        {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
        {body ? <ThemedText themeColor="textSecondary">{stripHtml(body)}</ThemedText> : null}
      </ThemedView>
    );
  }

  if (block.type === 'rich_text') {
    return (
      <ThemedView style={styles.block}>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        {body ? <ThemedText themeColor="textSecondary">{stripHtml(body)}</ThemedText> : null}
      </ThemedView>
    );
  }

  if (block.type === 'image_gallery') {
    const images = getArray(config.images);
    return (
      <ThemedView style={styles.block}>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        {images.slice(0, 4).map((image, index) => {
          const url = getString((image as Record<string, unknown>).url);
          return url ? <Image key={`${url}-${index}`} source={url} style={styles.galleryImage} contentFit="cover" /> : null;
        })}
      </ThemedView>
    );
  }

  if (block.type === 'featured_products') {
    const products = block.relations
      .map((relation) => relation.data)
      .filter((value) => Boolean(value && typeof value === 'object' && 'slug' in value))
      .map((value) => value as unknown as Product);
    return (
      <ThemedView style={styles.block}>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ThemedView>
    );
  }

  if (block.type === 'accordion' || block.type === 'testimonials' || block.type === 'pricing_cards' || block.type === 'alert_banner') {
    return (
      <ThemedView style={styles.block}>
        <ThemedText type="smallBold">{title ?? humanizeBlockType(block.type)}</ThemedText>
        {body ? <ThemedText themeColor="textSecondary">{stripHtml(body)}</ThemedText> : null}
      </ThemedView>
    );
  }

  return null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function humanizeBlockType(type: string): string {
  return type.replaceAll('_', ' ');
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  section: {
    gap: Spacing.three,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  darkSection: {
    padding: Spacing.three,
    backgroundColor: '#111827',
  },
  panel: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  hero: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  block: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  galleryImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});
