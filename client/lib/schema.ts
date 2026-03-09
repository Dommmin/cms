import type { BlogPost, Product, ProductReview, Store } from "@/types/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ── WebSite ───────────────────────────────────────────────────────────────────

export function buildWebSite(options: { name: string; url?: string; description?: string | null }) {
  const siteUrl = options.url ?? SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: options.name,
    url: siteUrl,
    ...(options.description ? { description: options.description } : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── Organization ─────────────────────────────────────────────────────────────

export function buildOrganization(options: {
  name: string;
  url?: string;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: options.name,
    url: options.url ?? SITE_URL,
    ...(options.logo ? { logo: { "@type": "ImageObject", url: options.logo } } : {}),
    ...(options.email ? { email: options.email } : {}),
    ...(options.phone ? { telephone: options.phone } : {}),
    ...(options.sameAs?.length ? { sameAs: options.sameAs } : {}),
  };
}

// ── BlogPosting ───────────────────────────────────────────────────────────────

export function buildBlogPosting(post: BlogPost, siteUrl?: string) {
  const base = siteUrl ?? SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    url: `${base}/blog/${post.slug}`,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    ...(post.featured_image ? { image: post.featured_image } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author.name } } : {}),
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };
}

// ── WebPage ───────────────────────────────────────────────────────────────────

export function buildWebPage(options: { title: string; description?: string | null; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    ...(options.description ? { description: options.description } : {}),
    url: options.url,
  };
}

// ── FAQPage ───────────────────────────────────────────────────────────────────

export function buildFaqPage(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ── Product ───────────────────────────────────────────────────────────────────

export function buildProduct(
  product: Product,
  options: {
    url: string;
    currencyCode?: string;
    reviews?: ProductReview[];
  },
) {
  const currency = options.currencyCode ?? "USD";
  const availableVariant = product.variants.find((v) => v.is_available);

  const offers =
    product.variants.length === 1
      ? {
          "@type": "Offer",
          sku: product.variants[0].sku,
          price: centsToDecimal(product.variants[0].price),
          priceCurrency: currency,
          availability: product.variants[0].is_available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: options.url,
        }
      : {
          "@type": "AggregateOffer",
          lowPrice: centsToDecimal(product.price_min),
          highPrice: centsToDecimal(product.price_max),
          priceCurrency: currency,
          offerCount: product.variants.length,
          availability: availableVariant
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        };

  const reviews = options.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ?? product.short_description
      ? { description: product.description ?? product.short_description }
      : {}),
    url: options.url,
    ...(product.images.length > 0 ? { image: product.images.map((img) => img.url) } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    offers,
    ...(avgRating !== null && reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };
}

// ── LocalBusiness ─────────────────────────────────────────────────────────────

export function buildLocalBusiness(store: Store) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: store.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.lat,
      longitude: store.lng,
    },
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.email ? { email: store.email } : {}),
    ...(store.opening_hours
      ? {
          openingHours: Object.entries(store.opening_hours).map(
            ([day, hours]) => `${day} ${hours}`,
          ),
        }
      : {}),
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────

export function buildBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
