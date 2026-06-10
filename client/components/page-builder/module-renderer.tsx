import { sanitizeHtml } from '@/lib/sanitize';
import type { Faq, Page } from '@/types/api';
import type { ModuleRendererProps } from './module-renderer.types';
import { BlogModule } from './modules/blog-module';
import { FaqClientModule } from './modules/faq-client-module';
import { FlashSalesHubModule } from './modules/flash-sales-hub-module';
import { GuestOrderTrackerModule } from './modules/guest-order-tracker-module';
import { NewsletterPreferencesModule } from './modules/newsletter-preferences-module';
import { ReturnsPortalModule } from './modules/returns-portal-module';
import { StoreLocatorModule } from './modules/store-locator-module';
import {
    BrandListingModule,
    CategoryListingModule,
    ProductListingModule,
} from './modules/storefront-listing-modules';

/**
 * Renders the content for module-type pages.
 * The API embeds module-specific data inside page.module_config
 * (e.g. rich-text HTML for 'content', FAQ items for 'faq').
 */

function ContentModule({ page }: { page: Page }) {
    const html =
        page.content ?? (page.module_config?.html as string | undefined);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-4xl font-bold tracking-tight">
                {page.title}
            </h1>
            {page.excerpt && (
                <p className="text-muted-foreground mb-8 text-lg">
                    {page.excerpt}
                </p>
            )}
            {html && (
                <div
                    className="prose prose-lg dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
                />
            )}
        </div>
    );
}

function FaqModule({ page }: { page: Page }) {
    const items = (page.module_config?.items as Faq[] | undefined) ?? [];

    return (
        <FaqClientModule
            items={items}
            pageTitle={page.title}
            pageExcerpt={page.excerpt ?? undefined}
        />
    );
}

export function ModuleRenderer({
    page,
    searchParams,
    locale,
}: ModuleRendererProps) {
    switch (page.module_name) {
        case 'content':
            return <ContentModule page={page} />;
        case 'faq':
            return <FaqModule page={page} />;
        case 'blog':
            return (
                <BlogModule
                    page={page}
                    searchParams={searchParams}
                    locale={locale}
                />
            );
        case 'returns_portal':
            return <ReturnsPortalModule page={page} />;
        case 'product_listing':
            return <ProductListingModule page={page} locale={locale} />;
        case 'category_listing':
            return <CategoryListingModule page={page} locale={locale} />;
        case 'brand_listing':
            return <BrandListingModule page={page} locale={locale} />;
        case 'store_locator':
            return <StoreLocatorModule page={page} />;
        case 'flash_sales_hub':
            return <FlashSalesHubModule page={page} />;
        case 'guest_order_tracker':
            return <GuestOrderTrackerModule page={page} />;
        case 'newsletter_preferences':
            return (
                <NewsletterPreferencesModule
                    page={page}
                    searchParams={searchParams}
                />
            );
        default:
            if (process.env.NODE_ENV === 'development') {
                return (
                    <div className="text-muted-foreground p-8 text-center">
                        Unknown module: <strong>{page.module_name}</strong>
                    </div>
                );
            }
            return null;
    }
}
