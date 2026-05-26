import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Share, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProduct, getProductReviews, getProducts, markReviewHelpful, submitProductReview } from '@/api/products';
import { ProductCard } from '@/components/product/product-card';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatMoney, stripHtml } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [added, setAdded] = useState(false);
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const auth = useAuth();
  const wishlist = useWishlist(auth.isAuthenticated);
  const { remember } = useRecentlyViewed();

  const productQuery = useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  });

  const product = productQuery.data;
  const reviewsQuery = useQuery({
    queryKey: ['product-reviews', slug],
    queryFn: () => getProductReviews(slug, { per_page: 3 }),
    enabled: Boolean(slug),
  });
  const relatedQuery = useQuery({
    queryKey: ['products', 'related', product?.category?.slug, product?.id],
    queryFn: () => getProducts({ category: product?.category?.slug, per_page: 5 }),
    enabled: Boolean(product?.category?.slug),
  });
  const reviewMutation = useMutation({
    mutationFn: () =>
      submitProductReview(slug, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim(),
      }),
    onSuccess: () => {
      setReviewRating(0);
      setReviewTitle('');
      setReviewBody('');
      void queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] });
    },
  });
  const helpfulMutation = useMutation({
    mutationFn: markReviewHelpful,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] }),
  });
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants.find((variant) => variant.is_available) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedVariantId]);

  useEffect(() => {
    if (product) {
      void remember(product);
    }
  }, [product, remember]);

  if (productQuery.isLoading) return <LoadingState />;
  if (productQuery.isError || !product) return <ErrorState onRetry={() => productQuery.refetch()} />;

  const images = product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const image = images[activeImageIndex] ?? images[0] ?? null;
  const variantAttributeGroups = Object.entries(
    product.variants.reduce<Record<string, string[]>>((groups, variant) => {
      Object.entries(variant.attributes).forEach(([name, value]) => {
        groups[name] ??= [];
        if (!groups[name].includes(value)) groups[name].push(value);
      });
      return groups;
    }, {}),
  );
  const relatedProducts = relatedQuery.data?.data.filter((item) => item.id !== product.id).slice(0, 4) ?? [];
  const isWishlisted = selectedVariant
    ? wishlist.wishlist?.items.some((item) => item.variant_id === selectedVariant.id)
    : false;
  const averageRating =
    reviewsQuery.data?.data.length
      ? Math.round((reviewsQuery.data.data.reduce((sum, review) => sum + review.rating, 0) / reviewsQuery.data.data.length) * 10) / 10
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassSurface style={styles.gallery}>
          <Image source={image?.url ?? undefined} style={styles.image} contentFit="contain" />
        </GlassSurface>
        {images.length > 1 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={images}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setActiveImageIndex(index)}
                style={[styles.thumbnailButton, index === activeImageIndex && styles.thumbnailActive]}>
                <Image source={item.thumb_url ?? item.url} style={styles.thumbnail} contentFit="contain" />
              </Pressable>
            )}
            contentContainerStyle={styles.thumbnails}
          />
        ) : null}

        <GlassSurface style={styles.header}>
          {product.brand ? (
            <ThemedText type="code" style={styles.kicker}>
              {product.brand.name.toUpperCase()}
            </ThemedText>
          ) : null}
          <ThemedText type="subtitle">{product.name}</ThemedText>
          {averageRating ? (
            <ThemedView style={styles.ratingRow}>
              <ThemedText type="smallBold">{renderStars(Math.round(averageRating))}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {averageRating}/5 · {reviewsQuery.data?.meta.total ?? reviewsQuery.data?.data.length} opinii
              </ThemedText>
            </ThemedView>
          ) : null}
          {(product.is_on_sale || product.discount_percentage) ? (
            <ThemedView style={styles.promoRow}>
              <ThemedView style={styles.salePill}>
                <ThemedText type="code" style={styles.saleText}>
                  {product.discount_percentage ? `-${product.discount_percentage}%` : 'PROMOCJA'}
                </ThemedText>
              </ThemedView>
              {product.compare_at_price_min ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.comparePrice}>
                  {formatMoney(product.compare_at_price_min)}
                </ThemedText>
              ) : null}
            </ThemedView>
          ) : null}
          <ThemedText type="title">{formatMoney(selectedVariant?.price ?? product.price_min)}</ThemedText>
          {product.omnibus_price_min ? (
            <ThemedText type="small" themeColor="textSecondary">
              Najniższa cena 30 dni: {formatMoney(product.omnibus_price_min)}
            </ThemedText>
          ) : null}
          <ThemedView style={styles.quantityRow}>
            <ThemedText type="smallBold">Ilość</ThemedText>
            <ThemedView style={styles.stepper}>
              <Pressable onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.stepperButton}>
                <ThemedText type="smallBold">-</ThemedText>
              </Pressable>
              <ThemedText type="smallBold">{quantity}</ThemedText>
              <Pressable onPress={() => setQuantity((value) => value + 1)} style={styles.stepperButton}>
                <ThemedText type="smallBold">+</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
          <Pressable
            onPress={() =>
              Share.share({
                title: product.name,
                message: product.name,
              })
            }
            style={styles.shareButton}>
            <ThemedText type="smallBold">Udostępnij produkt</ThemedText>
          </Pressable>
        </GlassSurface>

        {variantAttributeGroups.length > 0 ? (
          <GlassSurface style={styles.section}>
            <ThemedText type="smallBold">Wariant</ThemedText>
            {variantAttributeGroups.map(([attributeName, values]) => (
              <ThemedView key={attributeName} style={styles.variantGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  {attributeName}
                </ThemedText>
                <ThemedView style={styles.variants}>
                  {values.map((value) => {
                    const matchingVariant = product.variants.find((variant) => variant.attributes[attributeName] === value);
                    const isActive = selectedVariant?.attributes[attributeName] === value;
                    const isAvailable = matchingVariant?.is_available ?? false;
                return (
                  <Pressable
                        key={`${attributeName}-${value}`}
                        disabled={!isAvailable}
                        onPress={() => matchingVariant && setSelectedVariantId(matchingVariant.id)}
                        style={[styles.variant, isActive && styles.activeVariant, !isAvailable && styles.disabled]}>
                    <ThemedText type="smallBold" style={isActive && styles.activeText}>
                          {value}
                    </ThemedText>
                  </Pressable>
                );
              })}
                </ThemedView>
              </ThemedView>
            ))}
          </GlassSurface>
        ) : null}

        <GlassSurface style={styles.deliveryPanel}>
          <ThemedView style={styles.deliveryItem}>
            <ThemedView style={[styles.statusDot, selectedVariant?.is_available ? styles.statusAvailable : styles.statusUnavailable]} />
              <ThemedView style={styles.deliveryCopy}>
                <ThemedText type="smallBold">{selectedVariant?.is_available ? 'Dostępny' : 'Niedostępny'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedVariant ? `${selectedVariant.stock_quantity} szt. · wysyłka i odbiór zależą od wybranej metody dostawy.` : 'Wysyłka i odbiór zależą od wybranej metody dostawy.'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.deliveryItem}>
            <ThemedText type="smallBold">14 dni</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Zwrot zgodny z warunkami checkoutu.</ThemedText>
          </ThemedView>
        </GlassSurface>

        {auth.isAuthenticated && selectedVariant ? (
          <GlassSurface style={styles.section}>
            <Pressable
              onPress={() =>
                isWishlisted
                  ? wishlist.remove.mutate(selectedVariant.id)
                  : wishlist.add.mutate(selectedVariant.id)
              }
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">
                {isWishlisted ? 'Usuń z wishlisty' : 'Dodaj do wishlisty'}
              </ThemedText>
            </Pressable>
          </GlassSurface>
        ) : null}

        {product.short_description || product.description ? (
          <GlassSurface style={styles.section}>
            <ThemedText type="smallBold">Opis</ThemedText>
            <ThemedText themeColor="textSecondary">
              {stripHtml(product.short_description ?? product.description)}
            </ThemedText>
          </GlassSurface>
        ) : null}

        <GlassSurface style={styles.section}>
          <ThemedText type="smallBold">Opinie</ThemedText>
          {reviewsQuery.isLoading ? <ThemedText themeColor="textSecondary">Ładowanie</ThemedText> : null}
          {reviewsQuery.data?.data.length === 0 ? (
            <ThemedText themeColor="textSecondary">Brak opinii dla tego produktu.</ThemedText>
          ) : null}
          {reviewsQuery.data?.data.map((review) => (
            <ThemedView key={review.id} style={styles.review}>
              <ThemedView style={styles.reviewHeader}>
                <ThemedView style={styles.reviewAuthor}>
                  <ThemedText type="smallBold">
                    {review.author} · {renderStars(review.rating)}
                  </ThemedText>
                  <ThemedText type="code" themeColor="textSecondary">
                    {new Date(review.created_at).toLocaleDateString('pl-PL')}
                  </ThemedText>
                </ThemedView>
                {review.is_verified_purchase ? (
                  <ThemedView style={styles.verifiedPill}>
                    <ThemedText type="code" style={styles.verifiedText}>Zweryfikowany</ThemedText>
                  </ThemedView>
                ) : null}
              </ThemedView>
              {review.title ? <ThemedText type="smallBold">{review.title}</ThemedText> : null}
              <ThemedText themeColor="textSecondary">{review.body}</ThemedText>
              <Pressable onPress={() => helpfulMutation.mutate(review.id)} style={styles.helpfulButton}>
                <ThemedText type="smallBold">Pomocne ({review.helpful_count})</ThemedText>
              </Pressable>
            </ThemedView>
          ))}
          {auth.isAuthenticated ? (
            <ThemedView style={styles.reviewForm}>
              <ThemedText type="smallBold">Dodaj opinię</ThemedText>
              <ThemedView style={styles.stars}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Pressable key={rating} onPress={() => setReviewRating(rating)} style={styles.starButton}>
                    <ThemedText type="smallBold" style={rating <= reviewRating && styles.starActive}>
                      ★
                    </ThemedText>
                  </Pressable>
                ))}
              </ThemedView>
              <TextInput
                value={reviewTitle}
                onChangeText={setReviewTitle}
                placeholder="Tytuł opinii"
                placeholderTextColor={Storefront.colors.muted}
                style={styles.input}
              />
              <TextInput
                value={reviewBody}
                onChangeText={setReviewBody}
                placeholder="Treść opinii"
                placeholderTextColor={Storefront.colors.muted}
                multiline
                style={[styles.input, styles.textarea]}
              />
              <Pressable
                disabled={reviewMutation.isPending || reviewRating === 0 || reviewBody.trim().length < 3}
                onPress={() => reviewMutation.mutate()}
                style={[styles.secondaryButton, (reviewMutation.isPending || reviewRating === 0 || reviewBody.trim().length < 3) && styles.disabled]}>
                <ThemedText type="smallBold">Wyślij opinię</ThemedText>
              </Pressable>
              {reviewMutation.isSuccess ? <ThemedText type="small" themeColor="textSecondary">Opinia trafi do moderacji.</ThemedText> : null}
            </ThemedView>
          ) : null}
        </GlassSurface>

        {relatedProducts.length > 0 ? (
          <ThemedView style={styles.relatedSection}>
            <ThemedView style={styles.relatedHeader}>
              <ThemedText type="smallBold">Powiązane produkty</ThemedText>
              <Link href={`/categories` as Href} asChild>
                <Pressable>
                  <ThemedText type="small" style={styles.kicker}>Zobacz więcej</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
            <FlatList
              data={relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ThemedView style={styles.relatedCard}><ProductCard product={item} /></ThemedView>}
              contentContainerStyle={styles.relatedList}
            />
          </ThemedView>
        ) : null}
      </ScrollView>
      <GlassSurface style={styles.stickyBar}>
        <Pressable
          disabled={!selectedVariant?.is_available || addItem.isPending}
          onPress={() =>
            selectedVariant &&
            addItem.mutate(
              { variant_id: selectedVariant.id, quantity },
              {
                onSuccess: () => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1800);
                },
              },
            )
          }
          style={[styles.primaryButton, (!selectedVariant?.is_available || addItem.isPending) && styles.disabled]}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {added ? 'Dodano do koszyka' : selectedVariant?.is_available ? 'Dodaj do koszyka' : 'Niedostępny'}
          </ThemedText>
        </Pressable>
      </GlassSurface>
    </SafeAreaView>
  );
}

function renderStars(rating: number): string {
  return `${'★'.repeat(Math.max(0, Math.min(5, rating)))}${'☆'.repeat(Math.max(0, 5 - rating))}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
    paddingBottom: 128,
  },
  gallery: {
    width: '100%',
    aspectRatio: 0.94,
    overflow: 'hidden',
    borderRadius: Storefront.radius.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Storefront.radius.xl,
  },
  kicker: {
    color: Storefront.colors.primary,
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  thumbnails: {
    gap: Spacing.two,
  },
  thumbnailButton: {
    width: 72,
    height: 72,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  thumbnailActive: {
    borderColor: Storefront.colors.primary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  promoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  salePill: {
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.rose,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  saleText: {
    color: '#FFFFFF',
  },
  comparePrice: {
    textDecorationLine: 'line-through',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.one,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  stepperButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Storefront.radius.sm,
    backgroundColor: Storefront.colors.primarySoft,
  },
  shareButton: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  variantGroup: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  variants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  variant: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  activeVariant: {
    backgroundColor: Storefront.colors.primary,
    borderColor: Storefront.colors.primary,
  },
  activeText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.45,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  deliveryPanel: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  deliveryItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  deliveryCopy: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusDot: {
    width: 10,
    height: 10,
    marginTop: 5,
    borderRadius: 999,
  },
  statusAvailable: {
    backgroundColor: Storefront.colors.primary,
  },
  statusUnavailable: {
    backgroundColor: Storefront.colors.muted,
  },
  review: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.glassStrong,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  reviewAuthor: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  verifiedPill: {
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  verifiedText: {
    color: Storefront.colors.primaryDark,
  },
  helpfulButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  reviewForm: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  stars: {
    flexDirection: 'row',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  starButton: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starActive: {
    color: Storefront.colors.amber,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  textarea: {
    minHeight: 104,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
  },
  relatedSection: {
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  relatedList: {
    gap: Spacing.three,
  },
  relatedCard: {
    width: 176,
    backgroundColor: 'transparent',
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.four,
    borderTopLeftRadius: Storefront.radius.xl,
    borderTopRightRadius: Storefront.radius.xl,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
