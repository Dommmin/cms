# Catalog Content Model Demo Checklist

## Admin

1. Log in to `/admin` with the seeded admin user.
2. Open `E-commerce > Categories` and confirm `Kosmetyki`, `Elektronika`, and `Odzież` exist with child categories.
3. Edit `Kremy do twarzy` and confirm category attribute schema shows required and optional fields.
4. Edit `Smartfony` and confirm inherited parent schema rows coexist with child-specific rows.
5. Create a simple product in admin and verify the `Core Attributes` section matches the selected category schema.
6. Leave a required core attribute empty and confirm validation blocks save.
7. Edit `Krem nawilżający` and confirm product-level attributes are separate from variant options.
8. Edit variants for `Krem nawilżający` and confirm each variant has its own SKU, price, and stock.
9. Edit `T-shirt basic` and confirm size/color stay in variants, not in product-level attributes.
10. Open metafields for Product, Category, Page, and BlogPost and confirm dedicated definitions are available.
11. Confirm private/admin-only metafields are visible in admin editors but are not mixed with SEO, variants, or core attributes.
12. Publish or update a seeded blog post and verify the form does not require manual blog selection.

## Storefront

1. Open the product listing page and confirm the larger seeded demo catalog renders without crashes.
2. Apply attribute filters and confirm results narrow correctly.
3. Open `Hydrating Face Cream` and confirm the specification table renders product-level attributes.
4. Confirm `Hydrating Face Cream` requires variant selection by volume before add-to-cart.
5. Open `Basic T-Shirt` and confirm size/color selector drives variant availability.
6. Open `USB-C 30W Charger` and confirm a simple product can be added to cart immediately.
7. Open `Wireless Headphones` and confirm public metafields render only in the allowlisted extra details section.
8. Add a simple product to cart and verify the cart updates correctly.
9. Add a variant product to cart and verify the selected SKU/variant is preserved.
10. Go through checkout with seeded shipping/payment setup and confirm no catalog-model regressions appear.
11. Open `/blog` and confirm only published posts are listed.
12. Open a seeded blog post and confirm public blog metafields render while draft posts remain hidden.
13. Open system pages for blog listing, product listing, category listing, brand listing, privacy policy, and terms of service.
14. Visit a missing product or blog slug and confirm the storefront shows 404 instead of crashing.
15. Verify pages still load when optional metafields are absent.

## Regression Checks

1. Confirm `variant.attributes` are still present in product detail responses.
2. Confirm product detail API still returns separate `attribute_values`, `variant_options`, `variants`, and `metafields`.
3. Confirm category metafields are exposed only through public definitions.
4. Confirm page metafields expose only public definitions to storefront API consumers.
5. Confirm rerunning `php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder` does not duplicate demo records.
