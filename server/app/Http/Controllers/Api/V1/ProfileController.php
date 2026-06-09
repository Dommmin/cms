<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\AnonymizeUserData;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\DestroyAccountRequest;
use App\Http\Requests\Api\V1\RestrictProcessingRequest;
use App\Http\Requests\Api\V1\UpdatePasswordRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\GlobalSlot;
use App\Models\Order;
use App\Models\PrivacyRequest;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Setting;
use App\Models\Theme;
use App\Notifications\AccountDeletedNotification;
use App\Services\LegalDocumentVersionService;
use App\Services\PrivacyRequestService;
use App\Services\StorefrontPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends ApiController
{
    public function __construct(
        private readonly PrivacyRequestService $privacyRequestService,
        private readonly LegalDocumentVersionService $legalDocumentVersionService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return $this->ok(new UserResource($request->user()->load('customer.addresses')));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update([
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
        ]);

        if ($user->customer) {
            $user->customer->update([
                'first_name' => $data['first_name'] ?? $user->customer->first_name,
                'last_name' => $data['last_name'] ?? $user->customer->last_name,
                'phone' => $data['phone'] ?? $user->customer->phone,
                'company_name' => $data['company_name'] ?? $user->customer->company_name,
            ]);
        }

        return $this->ok(new UserResource($user->fresh()->load('customer')));
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return $this->ok(['message' => 'Password updated successfully']);
    }

    /**
     * GDPR Art. 17 — Right to erasure ("right to be forgotten").
     * Soft-deletes the account and revokes all tokens.
     */
    public function destroy(DestroyAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        // GDPR Art. 19 — Send confirmation email before anonymization
        $user->notify(new AccountDeletedNotification);
        $this->privacyRequestService->logCompleted(
            $user,
            'delete_account',
            [
                'processing_restricted_at' => $user->processing_restricted_at?->toIso8601String(),
            ],
            'Account anonymized after authenticated deletion request.',
        );

        (new AnonymizeUserData)->handle($user);

        return $this->ok(['message' => 'Account deleted successfully']);
    }

    /**
     * GDPR Art. 15 — Right of access / Subject Access Request (SAR).
     * Returns all personal data held about the authenticated user.
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user()->load(['customer.addresses']);
        $customer = $user->customer;

        $orders = [];
        if ($customer) {
            $orders = Order::query()
                ->where('customer_id', $customer->id)
                ->with(['items.variant', 'shipment'])
                ->get()
                ->map(function (Order $o): array {
                    /** @var Collection<int, array{product_name: mixed, quantity: mixed, unit_price: mixed}> $items */
                    $items = $o->items->map(fn ($i): array => [
                        'product_name' => $i->product_name,
                        'quantity' => $i->quantity,
                        'unit_price' => $i->unit_price,
                    ]);

                    return [
                        'reference_number' => $o->reference_number,
                        'status' => $o->status,
                        'total' => $o->total,
                        'created_at' => $o->created_at,
                        'items' => $items,
                    ];
                });
        }

        $reviews = [];
        if ($customer) {
            /** @var \Illuminate\Database\Eloquent\Collection<int, ProductReview> $reviewsCollection */
            $reviewsCollection = $customer->reviews()->with('product:id,name')->get();
            $reviews = $reviewsCollection->map(fn (ProductReview $r): array => [
                'product_name' => $r->product->name,
                'rating' => $r->rating,
                'body' => $r->body,
                'created_at' => $r->created_at,
            ]);
        }

        $newsletter = $customer?->newsletterSubscriber ? [
            'subscribed' => $customer->newsletterSubscriber->is_active,
            'subscribed_at' => $customer->newsletterSubscriber->created_at,
        ] : null;

        $this->privacyRequestService->logCompleted(
            $user,
            'export_data',
            ['exported_at' => now()->toIso8601String()],
            'Self-service personal data export generated.',
        );

        return $this->ok([
            'exported_at' => now()->toIso8601String(),
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'processing_restricted_at' => $user->processing_restricted_at,
                'privacy_requests' => PrivacyRequest::query()
                    ->where('user_id', $user->id)
                    ->latest('requested_at')
                    ->get(['type', 'status', 'requested_at', 'resolved_at', 'resolution_note']),
            ],
            'profile' => $customer ? [
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone' => $customer->phone,
                'company_name' => $customer->company_name,
                'addresses' => $customer->addresses->map(fn ($a): array => [
                    'street' => $a->street,
                    'street2' => $a->street2,
                    'city' => $a->city,
                    'postal_code' => $a->postal_code,
                    'country_code' => $a->country_code,
                ]),
            ] : null,
            'orders' => $orders,
            'reviews' => $reviews,
            'newsletter' => $newsletter,
        ]);
    }

    public function publicSettings(): JsonResponse
    {
        $settings = Setting::query()->where('is_public', true)->get();

        $grouped = $settings->groupBy('group')->map(fn ($group) => $group->mapWithKeys(fn ($setting): array => [
            $setting->key => $setting->value,
        ]));
        $cookieSettings = $grouped->get('cookie', collect());
        $cookieSettings['consent_version'] = $this->legalDocumentVersionService->consentVersionToken();
        $cookieSettings['consent_version_snapshot'] = $this->legalDocumentVersionService->consentVersionSnapshot();
        $grouped->put('cookie', $cookieSettings);

        $activeTheme = Theme::query()->where('is_active', true)->first([
            'slug', 'tokens', 'typography', 'spacing', 'buttons', 'containers',
        ]);

        $activeSlots = GlobalSlot::query()
            ->active()
            ->with('reusableBlock')
            ->orderBy('position')
            ->get();

        $relationsToResolve = [];
        foreach ($activeSlots as $slot) {
            $block = $slot->reusableBlock;
            if ($block && is_array($block->relations_config)) {
                foreach ($block->relations_config as $rel) {
                    $type = $rel['relation_type'] ?? null;
                    $id = $rel['relation_id'] ?? null;
                    if ($type && $id) {
                        $relationsToResolve[$type][] = $id;
                    }
                }
            }
        }

        $relationLookup = [];
        $pathService = resolve(StorefrontPathService::class);

        foreach ($relationsToResolve as $type => $ids) {
            $ids = array_values(array_unique($ids));
            if ($type === 'product' && config('modules.ecommerce')) {
                $products = Product::with(['thumbnail.media', 'brand', 'category', 'activeVariants:id,product_id,price,compare_at_price'])
                    ->whereIn('id', $ids)->get();

                foreach ($products as $product) {
                    $variants = $product->activeVariants;
                    $prices = $variants->pluck('price');
                    $priceMin = $prices->min() ?? 0;
                    $priceMax = $prices->max() ?? 0;
                    $isOnSale = $variants->some(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price);
                    $maxDiscount = $variants->map(fn ($v): ?int => $v->compare_at_price && $v->price
                        ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
                        : null
                    )->filter()->max();
                    $cheapestOnSale = $variants
                        ->filter(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price)
                        ->sortBy('price')
                        ->first();

                    $relationLookup[$type][$product->id] = [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'public_url' => $pathService->productPath($product),
                        'short_description' => $product->short_description,
                        'price_min' => $priceMin,
                        'price_max' => $priceMax,
                        'is_active' => $product->is_active,
                        'is_on_sale' => $isOnSale,
                        'discount_percentage' => $maxDiscount ?: null,
                        'compare_at_price_min' => $cheapestOnSale?->compare_at_price,
                        'omnibus_price_min' => null,
                        'variants' => $variants->map(fn ($v): array => [
                            'id' => $v->id,
                            'price' => $v->price,
                            'compare_at_price' => $v->compare_at_price,
                        ])->values()->toArray(),
                        'thumbnail' => ($thumbnail = $product->thumbnail) && ($media = $thumbnail->media) ? [
                            'url' => $media->getUrl(),
                            'alt' => $media->name ?: $product->name,
                        ] : null,
                        'brand' => $product->brand ? [
                            'id' => $product->brand->id,
                            'name' => $product->brand->name,
                            'slug' => $product->brand->slug,
                            'public_url' => $pathService->brandPath($product->brand),
                        ] : null,
                        'category' => [
                            'id' => $product->category->id,
                            'name' => $product->category->name,
                            'slug' => $product->category->slug,
                            'image_url' => $product->category->image_path,
                            'public_url' => $pathService->categoryPath($product->category),
                        ],
                        'images' => [],
                        'attributes' => [],
                        'created_at' => $product->created_at->toIso8601String(),
                    ];
                }
            } elseif ($type === 'blog_post') {
                $posts = BlogPost::with(['author', 'category'])->whereIn('id', $ids)->get();

                foreach ($posts as $post) {
                    $relationLookup[$type][$post->id] = [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'public_url' => $pathService->blogPostPath($post),
                        'excerpt' => $post->excerpt,
                        'featured_image' => $post->featured_image,
                        'published_at' => $post->published_at?->toIso8601String(),
                        'reading_time' => $post->reading_time,
                        'author' => $post->author ? ['id' => $post->author->id, 'name' => $post->author->name] : null,
                        'category' => $post->category ? [
                            'id' => $post->category->id,
                            'name' => $post->category->name,
                            'slug' => $post->category->slug,
                        ] : null,
                    ];
                }
            } elseif ($type === 'category') {
                $categories = Category::query()->whereIn('id', $ids)->get();

                foreach ($categories as $cat) {
                    $relationLookup[$type][$cat->id] = [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'description' => $cat->description,
                        'image_url' => $cat->image_path,
                        'parent_id' => $cat->parent_id,
                        'public_url' => $pathService->categoryPath($cat),
                    ];
                }
            } elseif ($type === 'brand') {
                $brands = Brand::query()->whereIn('id', $ids)->get();

                foreach ($brands as $brand) {
                    $relationLookup[$type][$brand->id] = [
                        'id' => $brand->id,
                        'name' => $brand->name,
                        'slug' => $brand->slug,
                        'logo_url' => $brand->logo_path,
                        'public_url' => $pathService->brandPath($brand),
                    ];
                }
            }
        }

        $slots = [];
        foreach ($activeSlots->groupBy(fn (GlobalSlot $slot): string => $slot->location->value) as $loc => $locationSlots) {
            $mappedSlots = [];
            foreach ($locationSlots as $slot) {
                $block = $slot->reusableBlock;
                $relations = [];

                if ($block && is_array($block->relations_config)) {
                    foreach ($block->relations_config as $index => $rel) {
                        $type = $rel['relation_type'] ?? null;
                        $id = $rel['relation_id'] ?? null;
                        $key = $rel['relation_key'] ?? null;

                        $relations[] = [
                            'id' => 0,
                            'relation_type' => $type,
                            'relation_id' => $id,
                            'relation_key' => $key,
                            'position' => $rel['position'] ?? $index,
                            'metadata' => $rel['metadata'] ?? null,
                            'data' => ($type && $id) ? ($relationLookup[$type][$id] ?? null) : null,
                        ];
                    }
                }

                $mappedSlots[] = [
                    'id' => $slot->id,
                    'label' => $slot->label,
                    'block_type' => $block ? $block->type : 'custom_html',
                    'configuration' => $block ? $block->configuration : ($slot->configuration ?? []),
                    'relations' => $relations,
                    'settings' => $slot->settings ?? [],
                    'position' => $slot->position,
                ];
            }

            $slots[$loc] = $mappedSlots;
        }

        return $this->ok([
            'settings' => $grouped,
            'modules' => config('modules'),
            'legal' => [
                'consent_version' => $this->legalDocumentVersionService->consentVersionToken(),
                'consent_version_snapshot' => $this->legalDocumentVersionService->consentVersionSnapshot(),
            ],
            'theme' => $activeTheme ? [
                'slug' => $activeTheme->slug,
                'tokens' => $activeTheme->tokens,
                'typography' => $activeTheme->typography,
                'spacing' => $activeTheme->spacing,
                'buttons' => $activeTheme->buttons,
                'containers' => $activeTheme->containers,
            ] : null,
            'slots' => $slots,
        ]);
    }

    /**
     * GDPR Art. 18 — Set processing restriction.
     */
    public function restrictProcessing(RestrictProcessingRequest $request): JsonResponse
    {
        $request->user()->update(['processing_restricted_at' => now()]);
        $this->privacyRequestService->logCompleted(
            $request->user(),
            'restrict_processing',
            ['restricted_at' => $request->user()->processing_restricted_at?->toIso8601String()],
            'Processing restriction enabled by the user.',
        );

        return $this->ok(['message' => 'Data processing has been restricted.']);
    }

    /**
     * GDPR Art. 18 — Lift processing restriction.
     */
    public function liftProcessingRestriction(RestrictProcessingRequest $request): JsonResponse
    {
        $request->user()->update(['processing_restricted_at' => null]);
        $this->privacyRequestService->logCompleted(
            $request->user(),
            'lift_processing_restriction',
            null,
            'Processing restriction removed by the user.',
        );

        return $this->noContent();
    }

    public function privacyRequests(Request $request): JsonResponse
    {
        return $this->ok([
            'data' => PrivacyRequest::query()
                ->where('user_id', $request->user()->id)
                ->latest('requested_at')
                ->get()
                ->map(fn (PrivacyRequest $privacyRequest): array => [
                    'id' => $privacyRequest->id,
                    'type' => $privacyRequest->type,
                    'status' => $privacyRequest->status,
                    'email' => $privacyRequest->email,
                    'payload' => $privacyRequest->payload,
                    'resolution_note' => $privacyRequest->resolution_note,
                    'requested_at' => $privacyRequest->requested_at->toIso8601String(),
                    'resolved_at' => $privacyRequest->resolved_at?->toIso8601String(),
                ])
                ->values(),
        ]);
    }
}
