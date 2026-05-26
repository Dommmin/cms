import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ProductCard } from '@/components/product/product-card';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { stripHtml } from '@/lib/format';
import type { Page, PageBlock, Product } from '@/types/api';

const iconMap: Record<string, string> = {
  check: '✓',
  star: '★',
  truck: '🚚',
  shield: '🛡',
  lock: '🔒',
  clock: '⏱',
  heart: '♥',
  gift: '🎁',
  award: '🏆',
  users: '👥',
  phone: '☎',
  mail: '✉',
  globe: '◎',
};

export function MobilePageRenderer({ page }: { page: Page }) {
  return (
    <ThemedView style={styles.wrapper}>
      {page.content ? (
        <GlassSurface style={styles.panel}>
          <ThemedText>{stripHtml(page.content)}</ThemedText>
        </GlassSurface>
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
  const subtitle = getString(config.subtitle);
  const body = getString(config.description) ?? getString(config.text) ?? getString(config.content) ?? getString(config.body);

  if (['hero_banner', 'call_to_action', 'promotional_banner'].includes(block.type)) {
    return (
      <GlassSurface style={styles.hero}>
        {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
        {subtitle ? <ThemedText type="smallBold">{subtitle}</ThemedText> : null}
        {body ? <ThemedText themeColor="textSecondary">{stripHtml(body)}</ThemedText> : null}
        <CtaButtons config={config} />
      </GlassSurface>
    );
  }

  if (block.type === 'rich_text' || block.type === 'custom_html') {
    return (
      <GlassSurface style={styles.block}>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        {body ? <ThemedText themeColor="textSecondary">{stripHtml(body)}</ThemedText> : null}
      </GlassSurface>
    );
  }

  if (block.type === 'image_gallery') {
    const images = getArray(config.images);
    return (
      <GlassSurface style={styles.block}>
        <BlockHeader title={title} subtitle={subtitle} />
        {images.slice(0, 8).map((image, index) => {
          const record = asRecord(image);
          const url = getString(record.url) ?? getString(record.image_url);
          return url ? <Image key={`${url}-${index}`} source={url} style={styles.galleryImage} contentFit="cover" /> : null;
        })}
      </GlassSurface>
    );
  }

  if (block.type === 'featured_products') {
    const products = block.relations
      .map((relation) => relation.data)
      .filter((value) => Boolean(value && typeof value === 'object' && 'slug' in value))
      .map((value) => value as unknown as Product);
    return (
      <ThemedView style={styles.transparentBlock}>
        <BlockHeader title={title} subtitle={subtitle} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products.slice(0, 8)}
          keyExtractor={(product) => String(product.id)}
          renderItem={({ item }) => (
            <ThemedView style={styles.productCell}>
              <ProductCard product={item} />
            </ThemedView>
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </ThemedView>
    );
  }

  if (block.type === 'stats_counter') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey="stats" variant="stat" />;
  }

  if (block.type === 'icon_list' || block.type === 'trust_badges') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey={block.type === 'trust_badges' ? 'badges' : 'items'} variant="icon" />;
  }

  if (block.type === 'steps_process' || block.type === 'timeline') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey={block.type === 'timeline' ? 'events' : 'steps'} variant="step" />;
  }

  if (block.type === 'testimonials') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey="items" variant="quote" />;
  }

  if (block.type === 'pricing_cards' || block.type === 'pricing_table') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey="plans" variant="pricing" />;
  }

  if (block.type === 'accordion' || block.type === 'tabs') {
    return <ArrayBlock config={config} title={title} subtitle={subtitle} itemKey="items" variant="text" fallbackKeys={['tabs', 'faqs']} />;
  }

  if (block.type === 'two_columns' || block.type === 'three_columns') {
    return <ColumnsBlock config={config} title={title} subtitle={subtitle} />;
  }

  if (block.type === 'newsletter_signup') {
    return (
      <GlassSurface style={styles.hero}>
        <BlockHeader title={title ?? 'Newsletter'} subtitle={subtitle ?? body} />
        <Link href={'/newsletter' as Href} asChild>
          <Pressable style={styles.primaryButton}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>Zapisz się</ThemedText>
          </Pressable>
        </Link>
      </GlassSurface>
    );
  }

  if (['categories_grid', 'featured_posts', 'brands_slider', 'logo_cloud', 'team_members'].includes(block.type)) {
    return <RelationBlock block={block} title={title ?? humanizeBlockType(block.type)} subtitle={subtitle} />;
  }

  if (block.type === 'video_embed' || block.type === 'map') {
    const embedUrl = block.type === 'video_embed' ? getVideoEmbedUrl(config) : getMapEmbedUrl(config);
    return (
      <GlassSurface style={styles.block}>
        <BlockHeader title={title ?? humanizeBlockType(block.type)} subtitle={subtitle ?? body} />
        {embedUrl ? (
          <ThemedView style={styles.embedFrame}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.embedWebView}
              allowsFullscreenVideo
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        ) : (
          <ThemedView style={styles.placeholder}>
            <ThemedText type="smallBold">{block.type === 'video_embed' ? 'Video' : 'Mapa'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Brak poprawnego adresu osadzenia.</ThemedText>
          </ThemedView>
        )}
      </GlassSurface>
    );
  }

  return (
    <GlassSurface style={styles.block}>
      <BlockHeader title={title ?? humanizeBlockType(block.type)} subtitle={subtitle ?? body} />
    </GlassSurface>
  );
}

function BlockHeader({ title, subtitle }: { title?: string | null; subtitle?: string | null }) {
  if (!title && !subtitle) return null;
  return (
    <ThemedView style={styles.header}>
      {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      {subtitle ? <ThemedText themeColor="textSecondary">{stripHtml(subtitle)}</ThemedText> : null}
    </ThemedView>
  );
}

function CtaButtons({ config }: { config: Record<string, unknown> }) {
  const label = getString(config.primary_label) ?? getString(config.button_label) ?? getString(config.cta_label);
  const url = getString(config.primary_url) ?? getString(config.button_url) ?? getString(config.cta_url);
  if (!label || !url) return null;
  const href = url.startsWith('/') ? url : '/';

  return (
    <Link href={href as Href} asChild>
      <Pressable style={styles.primaryButton}>
        <ThemedText type="smallBold" style={styles.primaryButtonText}>{label}</ThemedText>
      </Pressable>
    </Link>
  );
}

function ArrayBlock({
  config,
  title,
  subtitle,
  itemKey,
  fallbackKeys = [],
  variant,
}: {
  config: Record<string, unknown>;
  title?: string | null;
  subtitle?: string | null;
  itemKey: string;
  fallbackKeys?: string[];
  variant: 'stat' | 'icon' | 'step' | 'quote' | 'pricing' | 'text';
}) {
  const items = [itemKey, ...fallbackKeys].map((key) => getArray(config[key])).find((values) => values.length > 0) ?? [];
  if (items.length === 0 && !title && !subtitle) return null;

  return (
    <GlassSurface style={styles.block}>
      <BlockHeader title={title} subtitle={subtitle} />
      {items.map((item, index) => (
        <ArrayItem key={index} item={asRecord(item)} index={index} variant={variant} />
      ))}
    </GlassSurface>
  );
}

function ArrayItem({ item, index, variant }: { item: Record<string, unknown>; index: number; variant: 'stat' | 'icon' | 'step' | 'quote' | 'pricing' | 'text' }) {
  const title = getString(item.title) ?? getString(item.label) ?? getString(item.name);
  const description = getString(item.description) ?? getString(item.content) ?? getString(item.text) ?? getString(item.sublabel);

  if (variant === 'stat') {
    return (
      <ThemedView style={styles.statItem}>
        <ThemedText type="title" style={styles.accent}>{getString(item.value) ?? '0'}{getString(item.suffix) ?? ''}</ThemedText>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      </ThemedView>
    );
  }

  if (variant === 'pricing') {
    return (
      <ThemedView style={styles.cardItem}>
        {item.is_popular ? <ThemedText type="code" style={styles.accent}>POPULAR</ThemedText> : null}
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        <ThemedText type="title">{String(item.price_monthly ?? item.price ?? '')}</ThemedText>
        {getArray(item.features).slice(0, 6).map((feature, i) => (
          <ThemedText key={i} type="small" themeColor="textSecondary">✓ {String(feature)}</ThemedText>
        ))}
      </ThemedView>
    );
  }

  if (variant === 'quote') {
    return (
      <ThemedView style={styles.cardItem}>
        {item.rating ? <ThemedText style={styles.accent}>{'★'.repeat(Number(item.rating))}</ThemedText> : null}
        {description ? <ThemedText themeColor="textSecondary">“{description}”</ThemedText> : null}
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.rowItem}>
      <ThemedView style={styles.itemIcon}>
        <ThemedText type="smallBold">{variant === 'step' ? index + 1 : iconMap[getString(item.icon) ?? 'check'] ?? '✓'}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.itemCopy}>
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
        {description ? <ThemedText type="small" themeColor="textSecondary">{stripHtml(description)}</ThemedText> : null}
      </ThemedView>
    </ThemedView>
  );
}

function ColumnsBlock({ config, title, subtitle }: { config: Record<string, unknown>; title?: string | null; subtitle?: string | null }) {
  const columns = getArray(config.columns).length > 0 ? getArray(config.columns) : [config.left, config.right, config.third].filter(Boolean);
  return (
    <GlassSurface style={styles.block}>
      <BlockHeader title={title} subtitle={subtitle} />
      {columns.map((column, index) => {
        const record = asRecord(column);
        const columnTitle = getString(record.title) ?? getString(record.heading);
        const columnBody = getString(record.description) ?? getString(record.content) ?? getString(record.text);
        return (
          <ThemedView key={index} style={styles.cardItem}>
            {columnTitle ? <ThemedText type="smallBold">{columnTitle}</ThemedText> : null}
            {columnBody ? <ThemedText type="small" themeColor="textSecondary">{stripHtml(columnBody)}</ThemedText> : null}
          </ThemedView>
        );
      })}
    </GlassSurface>
  );
}

function RelationBlock({ block, title, subtitle }: { block: PageBlock; title: string; subtitle?: string | null }) {
  const records = block.relations.map((relation) => relation.data).filter(Boolean).map((value) => value as Record<string, unknown>);
  return (
    <GlassSurface style={styles.block}>
      <BlockHeader title={title} subtitle={subtitle} />
      {records.slice(0, 8).map((record, index) => (
        <ThemedView key={index} style={styles.rowItem}>
          <ThemedView style={styles.itemCopy}>
            <ThemedText type="smallBold">{getString(record.name) ?? getString(record.title) ?? `#${index + 1}`}</ThemedText>
            {getString(record.description) ? <ThemedText type="small" themeColor="textSecondary">{stripHtml(getString(record.description) ?? '')}</ThemedText> : null}
          </ThemedView>
        </ThemedView>
      ))}
    </GlassSurface>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getVideoEmbedUrl(config: Record<string, unknown>): string | null {
  const url = getString(config.embed_url) ?? getString(config.url) ?? getString(config.video_url);
  if (!url) return null;

  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) return url;

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url.startsWith('https://') ? url : null;
}

function getMapEmbedUrl(config: Record<string, unknown>): string | null {
  const embedUrl = getString(config.embed_url) ?? getString(config.map_url);
  if (embedUrl?.startsWith('https://')) return embedUrl;

  const lat = typeof config.lat === 'number' ? config.lat : typeof config.latitude === 'number' ? config.latitude : null;
  const lng = typeof config.lng === 'number' ? config.lng : typeof config.longitude === 'number' ? config.longitude : null;
  if (lat !== null && lng !== null) return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  const address = getString(config.address) ?? getString(config.location);
  return address ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed` : null;
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
    backgroundColor: 'transparent',
  },
  darkSection: {
    padding: Spacing.three,
    borderRadius: Storefront.radius.xl,
    backgroundColor: Storefront.colors.primaryDark,
  },
  panel: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  hero: {
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Storefront.radius.xl,
  },
  block: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  transparentBlock: {
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  header: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  galleryImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  horizontalList: {
    gap: Spacing.three,
  },
  productCell: {
    width: 176,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  accent: {
    color: Storefront.colors.primary,
  },
  rowItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  cardItem: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  itemIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  itemCopy: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  placeholder: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  embedFrame: {
    height: 210,
    overflow: 'hidden',
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  embedWebView: {
    flex: 1,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
});
