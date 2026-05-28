# PHPStan/Larastan Errors TODO List
This document tracks pre-existing PHPStan/Larastan errors in the codebase. Use this checklist to fix them systematically.
## app/Actions/ImpersonateCustomer.php
- [ ] **Line 20** (argument.type): Parameter #1 $boolean of function abort_unless expects bool, App\Models\User|null given.
## app/Concerns/HasVersions.php (in context of class App\Models\BlogPost)
- [ ] **Line 47** (return.type): Method App\Models\BlogPost::latestVersion() should return App\Models\ModelVersion|null but returns Illuminate\Database\Eloquent\Model|null.
- [ ] **Line 72** (return.type): Method App\Models\BlogPost::createVersion() should return App\Models\ModelVersion but returns Illuminate\Database\Eloquent\Model.
- [ ] **Line 106** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\BlogPost) and 'versionedAttributes' will always evaluate to true.
- [ ] **Line 113** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\BlogPost) and 'maxVersions' will always evaluate to true.
## app/Concerns/HasVersions.php (in context of class App\Models\Category)
- [ ] **Line 47** (return.type): Method App\Models\Category::latestVersion() should return App\Models\ModelVersion|null but returns Illuminate\Database\Eloquent\Model|null.
- [ ] **Line 72** (return.type): Method App\Models\Category::createVersion() should return App\Models\ModelVersion but returns Illuminate\Database\Eloquent\Model.
- [ ] **Line 106** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\Category) and 'versionedAttributes' will always evaluate to true.
- [ ] **Line 113** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\Category) and 'maxVersions' will always evaluate to true.
## app/Concerns/HasVersions.php (in context of class App\Models\Product)
- [ ] **Line 47** (return.type): Method App\Models\Product::latestVersion() should return App\Models\ModelVersion|null but returns Illuminate\Database\Eloquent\Model|null.
- [ ] **Line 72** (return.type): Method App\Models\Product::createVersion() should return App\Models\ModelVersion but returns Illuminate\Database\Eloquent\Model.
- [ ] **Line 106** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\Product) and 'versionedAttributes' will always evaluate to true.
- [ ] **Line 113** (function.alreadyNarrowedType): Call to function property_exists() with $this(App\Models\Product) and 'maxVersions' will always evaluate to true.
## app/Concerns/ProfileValidationRules.php (in context of class App\Actions\Fortify\CreateNewUser)
- [ ] **Line 42** (return.type): Method App\Actions\Fortify\CreateNewUser::emailRules() should return array<int, array<mixed>|Illuminate\Contracts\Validation\Rule|string> but returns array<int, Illuminate\Validation\Rules\Unique|string>.
## app/Concerns/ProfileValidationRules.php (in context of class App\Http\Requests\Settings\ProfileUpdateRequest)
- [ ] **Line 42** (return.type): Method App\Http\Requests\Settings\ProfileUpdateRequest::emailRules() should return array<int, array<mixed>|Illuminate\Contracts\Validation\Rule|string> but returns array<int, Illuminate\Validation\Rules\Unique|string>.
## app/Console/Commands/GenerateMerchantFeed.php
- [ ] **Line 29** (larastan.relationExistence): Relation 'translations' is not found in App\Models\Product model.
## app/Console/Commands/ImportSearchIndex.php
- [ ] **Line 74** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Model::searchableAs().
- [ ] **Line 99** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Model::shouldBeSearchable().
- [ ] **Line 100** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Model::searchable().
- [ ] **Line 103** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Model::unsearchable().
## app/Data/AdminProductData.php
- [ ] **Line 50** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
## app/Events/FormSubmitted.php
- [ ] **Line 24** (class.notFound): Parameter $submission of method App\Events\FormSubmitted::__construct() has invalid type App\Modules\Forms\Domain\Models\FormSubmission.
- [ ] **Line 24** (class.notFound): Property App\Events\FormSubmitted::$submission has unknown class App\Modules\Forms\Domain\Models\FormSubmission as its type.
- [ ] **Line 25** (class.notFound): Parameter $form of method App\Events\FormSubmitted::__construct() has invalid type App\Modules\Forms\Domain\Models\Form.
- [ ] **Line 25** (class.notFound): Property App\Events\FormSubmitted::$form has unknown class App\Modules\Forms\Domain\Models\Form as its type.
## app/Exports/OrdersExport.php
- [ ] **Line 62** (nullsafe.neverNull): Using nullsafe method call on non-nullable type Carbon\Carbon. Use -> instead.
## app/Exports/ProductsExport.php
- [ ] **Line 50** (nullsafe.neverNull): Using nullsafe property access "?->price" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 51** (nullsafe.neverNull): Using nullsafe property access "?->stock_quantity" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Controllers/Admin/Cms/PageBuilderController.php
- [ ] **Line 45** (return.type): Anonymous function should return array{id: int, section_type: string|null, layout: string, variant: string|null, settings: array<string, mixed>|null, position: int, is_active: bool, blocks: Illuminate\Support\Collection<int, array{id: int, type: 'accordion'|'alert_banner'|'brands_slider'|'call_to_action'|'categories_grid'|'countdown_timer'|'custom_html'|'featured_posts'|'featured_products'|'form_embed'|'hero_banner'|'icon_list'|'image_gallery'|'logo_cloud'|'map'|'newsletter_signup'|'pricing_cards'|'pricing_table'|'promotional_banner'|'rich_text'|'stats_counter'|'steps_process'|'tabs'|'team_members'|'testimonials'|'three_columns'|'timeline'|'trust_badges'|'two_columns'|'video_embed', configuration: array<string, mixed>|null, position: int, is_active: bool, reusable_block_id: int|null, reusable_block_name: string|null, relations: array<int, array{id: int, relation_type: string, relation_id: int, relation_key: string|null, position: int, metadata: array|null}>}>} but returns array{id: int, section_type: string|null, layout: string, variant: string|null, settings: array<string, mixed>|null, position: int, is_active: bool, blocks: Illuminate\Support\Collection<int, array{id: int, type: 'accordion'|'alert_banner'|'brands_slider'|'call_to_action'|'categories_grid'|'countdown_timer'|'custom_html'|'featured_posts'|'featured_products'|'form_embed'|'hero_banner'|'icon_list'|'image_gallery'|'logo_cloud'|'map'|'newsletter_signup'|'pricing_cards'|'pricing_table'|'promotional_banner'|'rich_text'|'stats_counter'|'steps_process'|'tabs'|'team_members'|'testimonials'|'three_columns'|'timeline'|'trust_badges'|'two_columns'|'video_embed', configuration: array<string, mixed>|null, position: int, is_active: bool, reusable_block_id: int|null, reusable_block_name: string|null, relations: array<int, array{id: int, relation_type: string, relation_id: int, relation_key: string|null, position: int, metadata: array|null}>}>}.
- [ ] **Line 45** (argument.type): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,App\Models\PageSection>::map() expects callable(App\Models\PageSection, int): array{id: int, section_type: string|null, layout: string, variant: string|null, settings: array<string, mixed>|null, position: int, is_active: bool, blocks: Illuminate\Support\Collection<int, array{id: int, type: 'accordion'|'alert_banner'|'brands_slider'|'call_to_action'|'categories_grid'|'countdown_timer'|'custom_html'|'featured_posts'|'featured_products'|'form_embed'|'hero_banner'|'icon_list'|'image_gallery'|'logo_cloud'|'map'|'newsletter_signup'|'pricing_cards'|'pricing_table'|'promotional_banner'|'rich_text'|'stats_counter'|'steps_process'|'tabs'|'team_members'|'testimonials'|'three_columns'|'timeline'|'trust_badges'|'two_columns'|'video_embed', configuration: array<string, mixed>|null, position: int, is_active: bool, reusable_block_id: int|null, reusable_block_name: string|null, relations: array<int, array{id: int, relation_type: string, relation_id: int, relation_key: string|null, position: int, metadata: array|null}>}>}, Closure(App\Models\PageSection): array{id: int, section_type: string|null, layout: string, variant: string|null, settings: array<string, mixed>|null, position: int, is_active: bool, blocks: Illuminate\Support\Collection<int, array{id: int, type: 'accordion'|'alert_banner'|'brands_slider'|'call_to_action'|'categories_grid'|'countdown_timer'|'custom_html'|'featured_posts'|'featured_products'|'form_embed'|'hero_banner'|'icon_list'|'image_gallery'|'logo_cloud'|'map'|'newsletter_signup'|'pricing_cards'|'pricing_table'|'promotional_banner'|'rich_text'|'stats_counter'|'steps_process'|'tabs'|'team_members'|'testimonials'|'three_columns'|'timeline'|'trust_badges'|'two_columns'|'video_embed', configuration: array<string, mixed>|null, position: int, is_active: bool, reusable_block_id: int|null, reusable_block_name: string|null, relations: array<int, array{id: int, relation_type: string, relation_id: int, relation_key: string|null, position: int, metadata: array|null}>}>} given.
- [ ] **Line 187** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 188** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$section_type.
- [ ] **Line 189** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$layout.
- [ ] **Line 190** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant.
- [ ] **Line 191** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$settings.
- [ ] **Line 192** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$position.
- [ ] **Line 193** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$is_active.
- [ ] **Line 238** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 239** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$type.
- [ ] **Line 240** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$configuration.
- [ ] **Line 241** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$position.
- [ ] **Line 242** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$is_active.
## app/Http/Controllers/Admin/DashboardController.php
- [ ] **Line 229** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 246** (property.notFound): Access to an undefined property App\Models\OrderItem::$total_qty.
- [ ] **Line 247** (property.notFound): Access to an undefined property App\Models\OrderItem::$total_revenue.
- [ ] **Line 270** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 304** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 305** (nullsafe.neverNull): Using nullsafe method call on non-nullable type Carbon\Carbon. Use -> instead.
## app/Http/Controllers/Admin/Ecommerce/CategoryController.php
- [ ] **Line 110** (method.unused): Method App\Http\Controllers\Admin\Ecommerce\CategoryController::buildCategoryTree() is unused.
- [ ] **Line 139** (method.unused): Method App\Http\Controllers\Admin\Ecommerce\CategoryController::isDescendant() is unused.
## app/Http/Controllers/Admin/Ecommerce/DiscountController.php
- [ ] **Line 60** (method.notFound): Call to an undefined method App\Models\Discount::products().
- [ ] **Line 64** (method.notFound): Call to an undefined method App\Models\Discount::categories().
- [ ] **Line 92** (method.notFound): Call to an undefined method App\Models\Discount::products().
- [ ] **Line 93** (method.notFound): Call to an undefined method App\Models\Discount::categories().
## app/Http/Controllers/Admin/Ecommerce/ProductVariantController.php
- [ ] **Line 26** (new.noConstructor): Class App\Queries\Admin\ProductVariantIndexQuery does not have a constructor and must be instantiated without any parameters.
- [ ] **Line 36** (new.noConstructor): Class App\Queries\Admin\ProductVariantIndexQuery does not have a constructor and must be instantiated without any parameters.
- [ ] **Line 78** (new.noConstructor): Class App\Queries\Admin\ProductVariantIndexQuery does not have a constructor and must be instantiated without any parameters.
- [ ] **Line 154** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 154** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\ProductType. Use -> instead.
## app/Http/Controllers/Admin/Ecommerce/ReturnRequestController.php
- [ ] **Line 49** (class.notFound): Parameter $request of method App\Http\Controllers\Admin\Ecommerce\ReturnRequestController::update() has invalid type App\Http\Controllers\Admin\Ecommerce\UpdateReturnRequest.
- [ ] **Line 51** (class.notFound): Call to method validated() on an unknown class App\Http\Controllers\Admin\Ecommerce\UpdateReturnRequest.
- [ ] **Line 56** (notIdentical.alwaysTrue): Strict comparison using !== between string and App\Enums\ReturnStatusEnum will always evaluate to true.
## app/Http/Controllers/Admin/Ecommerce/ShippingMethodController.php
- [ ] **Line 166** (argument.byRef): Parameter #1 $array of function reset is passed by reference, so it expects variables only.
- [ ] **Line 176** (argument.byRef): Parameter #1 $array of function reset is passed by reference, so it expects variables only.
## app/Http/Controllers/Admin/LocaleController.php
- [ ] **Line 44** (booleanAnd.rightAlwaysTrue): Right side of && is always true.
- [ ] **Line 57** (booleanAnd.rightAlwaysTrue): Right side of && is always true.
## app/Http/Controllers/Admin/Marketing/AutomationController.php
- [ ] **Line 29** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,App\Models\NewsletterCampaign>::map() contains unresolvable type.
- [ ] **Line 32** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 32** (nullsafe.neverNull): Using nullsafe property access on non-nullable type string. Use -> instead.
- [ ] **Line 33** (method.nonObject): Cannot call method label() on string.
- [ ] **Line 33** (nullsafe.neverNull): Using nullsafe method call on non-nullable type string. Use -> instead.
- [ ] **Line 34** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 35** (method.nonObject): Cannot call method label() on string.
- [ ] **Line 97** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 97** (nullsafe.neverNull): Using nullsafe property access on non-nullable type string. Use -> instead.
- [ ] **Line 98** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 112** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 112** (nullsafe.neverNull): Using nullsafe property access on non-nullable type string. Use -> instead.
- [ ] **Line 113** (property.nonObject): Cannot access property $value on string.
- [ ] **Line 129** (identical.alwaysFalse): Strict comparison using === between string and App\Enums\CampaignStatusEnum::Ready will always evaluate to false.
## app/Http/Controllers/Admin/MediaController.php
- [ ] **Line 102** (method.notFound): Call to an undefined method Spatie\Image\Image::rotate().
## app/Http/Controllers/Admin/MetafieldController.php
- [ ] **Line 25** (class.notFound): Call to method syncMetafields() on an unknown class App\Concerns\HasMetafields.
- [ ] **Line 25** (varTag.trait): PHPDoc tag @var for variable $model has invalid type App\Concerns\HasMetafields.
- [ ] **Line 25** (varTag.nativeType): PHPDoc tag @var with type App\Concerns\HasMetafields is not subtype of native type Illuminate\Database\Eloquent\Model.
## app/Http/Controllers/Admin/ModelVersionController.php
- [ ] **Line 74** (varTag.unresolvableType): PHPDoc tag @var for variable $model contains unresolvable type.
## app/Http/Controllers/Admin/NotificationController.php
- [ ] **Line 126** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Controllers/Admin/UserController.php
- [ ] **Line 121** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Relations\HasOne::withTrashed().
- [ ] **Line 122** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Relations\HasOne::withTrashed().
## app/Http/Controllers/Admin/WebhookController.php
- [ ] **Line 31** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$status.
## app/Http/Controllers/Api/V1/Auth/SocialLoginController.php
- [ ] **Line 29** (method.notFound): Call to an undefined method Laravel\Socialite\Contracts\Provider::stateless().
- [ ] **Line 43** (method.notFound): Call to an undefined method Laravel\Socialite\Contracts\Provider::stateless().
## app/Http/Controllers/Api/V1/Blog/BlogPostController.php
- [ ] **Line 103** (property.notFound): Access to an undefined property App\Models\BlogPost::$votes_up_count.
- [ ] **Line 104** (property.notFound): Access to an undefined property App\Models\BlogPost::$votes_down_count.
## app/Http/Controllers/Api/V1/CartController.php
- [ ] **Line 49** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 78** (booleanAnd.leftAlwaysTrue): Left side of && is always true.
## app/Http/Controllers/Api/V1/CheckoutController.php
- [ ] **Line 126** (argument.type): Parameter #1 $user of method App\Services\CartService::getOrCreateCart() expects App\Models\User|null, Illuminate\Contracts\Auth\Authenticatable|null given.
- [ ] **Line 150** (argument.type): Parameter $user of method App\Services\CheckoutService::checkout() expects App\Models\User|null, Illuminate\Contracts\Auth\Authenticatable|null given.
- [ ] **Line 185** (nullCoalesce.offset): Offset 'bank_details' on array{action: 'none'|'redirect'|'wait', redirect_url: string|null, message: string} on left side of ?? does not exist.
## app/Http/Controllers/Api/V1/ConsentController.php
- [ ] **Line 42** (nullsafe.neverNull): Using nullsafe property access "?->granted" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 43** (nullsafe.neverNull): Using nullsafe property access "?->granted" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Controllers/Api/V1/MetafieldController.php
- [ ] **Line 36** (varTag.unresolvableType): PHPDoc tag @var for variable $model contains unresolvable type.
## app/Http/Controllers/Api/V1/OrderController.php
- [ ] **Line 111** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
## app/Http/Controllers/Api/V1/PaymentController.php
- [ ] **Line 25** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Order. Use -> instead.
## app/Http/Controllers/Api/V1/ProductController.php
- [ ] **Line 120** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 127** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 132** (ternary.alwaysTrue): Ternary operator condition is always true.
- [ ] **Line 224** (return.type): Anonymous function should return non-empty-array<int, array{id: int, name: string, slug: string, is_active: bool, short_description: array<mixed>|null, price_min: mixed, price_max: mixed, thumbnail: array{url: string, alt: string}|null, ...}> but returns non-empty-array<int, array{id: int, name: string, slug: string, is_active: bool, short_description: array<mixed>|null, price_min: mixed, price_max: mixed, thumbnail: array{url: string, alt: string}|null, ...}>.
- [ ] **Line 234** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 236** (ternary.alwaysTrue): Ternary operator condition is always true.
- [ ] **Line 277** (notIdentical.alwaysTrue): Strict comparison using !== between int and null will always evaluate to true.
- [ ] **Line 397** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$brand.
- [ ] **Line 410** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 411** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 416** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$activeVariants.
- [ ] **Line 454** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 455** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
- [ ] **Line 462** (argument.unresolvableType): Parameter #1 $array of function usort contains unresolvable type.
- [ ] **Line 462** (argument.unresolvableType): Parameter #2 $callback of function usort contains unresolvable type.
- [ ] **Line 478** (argument.unresolvableType): Parameter #1 $array of function usort contains unresolvable type.
- [ ] **Line 478** (argument.unresolvableType): Parameter #2 $callback of function usort contains unresolvable type.
- [ ] **Line 480** (argument.unresolvableType): Parameter #1 $array of function array_values contains unresolvable type.
- [ ] **Line 481** (argument.unresolvableType): Parameter #1 $array of function usort contains unresolvable type.
- [ ] **Line 481** (argument.unresolvableType): Parameter #2 $callback of function usort contains unresolvable type.
## app/Http/Controllers/Api/V1/ProfileController.php
- [ ] **Line 105** (return.type): Anonymous function should return array{reference_number: string, status: App\States\Order\OrderState, total: int, created_at: Carbon\Carbon, items: Illuminate\Support\Collection<int, array{product_name: mixed, quantity: mixed, unit_price: mixed}>} but returns array{reference_number: string, status: App\States\Order\OrderState, total: int, created_at: Carbon\Carbon, items: Illuminate\Support\Collection<int, array{product_name: mixed, quantity: mixed, unit_price: mixed}>}.
- [ ] **Line 119** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,Illuminate\Database\Eloquent\Model>::map() contains unresolvable type.
- [ ] **Line 120** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$product.
- [ ] **Line 121** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$rating.
- [ ] **Line 122** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$body.
- [ ] **Line 123** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$created_at.
- [ ] **Line 128** (property.notFound): Access to an undefined property App\Models\NewsletterSubscriber::$subscribed.
- [ ] **Line 129** (property.notFound): Access to an undefined property App\Models\NewsletterSubscriber::$subscribed_at.
## app/Http/Controllers/Api/V1/ReviewController.php
- [ ] **Line 82** (argument.type): Parameter #1 $boolean of function abort_unless expects bool, App\Models\Customer|null given.
## app/Http/Controllers/Api/V1/SupportController.php
- [ ] **Line 25** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Controllers/BlogFeedController.php
- [ ] **Line 53** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Middleware/HandleAppearance.php
- [ ] **Line 130** (function.alreadyNarrowedType): Call to function is_string() with string will always evaluate to true.
## app/Http/Middleware/IdempotencyMiddleware.php
- [ ] **Line 40** (nullsafe.neverNull): Using nullsafe property access "?->id" on left side of ?? is unnecessary. Use -> instead.
## app/Http/Requests/Admin/Ecommerce/UpdateReturnRequest.php
- [ ] **Line 23** (return.type): Method App\Http\Requests\Admin\Ecommerce\UpdateReturnRequest::rules() should return array<string, array<int, string>> but returns array<string, list<Illuminate\Validation\Rules\Enum|string>>.
## app/Http/Requests/Admin/StoreMenuRequest.php
- [ ] **Line 34** (return.phpDocType): PHPDoc tag @return with type array<string, array<mixed>|Illuminate\Contracts\Validation\ValidationRule|string> is incompatible with native type void.
## app/Http/Requests/Admin/StoreUserRequest.php
- [ ] **Line 25** (return.type): Method App\Http\Requests\Admin\StoreUserRequest::rules() should return array<string, array<int, string>|string> but returns array<string, list<Illuminate\Validation\Rules\Password|string|null>>.
## app/Http/Requests/Admin/UpdateMenuRequest.php
- [ ] **Line 46** (return.phpDocType): PHPDoc tag @return with type array<string, array<mixed>|Illuminate\Contracts\Validation\ValidationRule|string> is incompatible with native type void.
## app/Http/Requests/Admin/UpdateUserRequest.php
- [ ] **Line 28** (return.type): Method App\Http\Requests\Admin\UpdateUserRequest::rules() should return array<string, array<int, string>|string> but returns array<string, list<Illuminate\Validation\Rules\Password|string|null>>.
## app/Http/Requests/StoreCheckoutRequest.php
- [ ] **Line 31** (return.type): Method App\Http\Requests\StoreCheckoutRequest::rules() should return array<string, array<int, Illuminate\Validation\Rule|string>> but returns array<string, list<Illuminate\Validation\Rules\Enum|string>>.
## app/Http/Requests/StoreReturnRequest.php
- [ ] **Line 30** (return.type): Method App\Http\Requests\StoreReturnRequest::rules() should return array<string, array<int, Illuminate\Validation\Rule|string>> but returns array<string, list<Illuminate\Validation\Rules\Enum|string>>.
## app/Http/Resources/Api/V1/CartItemResource.php
- [ ] **Line 21** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\ProductVariant. Use -> instead.
- [ ] **Line 29** (ternary.alwaysTrue): Ternary operator condition is always true.
## app/Http/Resources/Api/V1/OrderResource.php
- [ ] **Line 34** (nullsafe.neverNull): Using nullsafe method call on non-nullable type Carbon\Carbon. Use -> instead.
- [ ] **Line 50** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,App\Models\OrderStatusHistory>::map() contains unresolvable type.
- [ ] **Line 51** (property.notFound): Access to an undefined property App\Models\OrderStatusHistory::$status.
- [ ] **Line 52** (property.notFound): Access to an undefined property App\Models\OrderStatusHistory::$note.
- [ ] **Line 53** (property.notFound): Access to an undefined property App\Models\OrderStatusHistory::$created_at.
## app/Http/Resources/Api/V1/PageResource.php
- [ ] **Line 38** (instanceof.alwaysTrue): Instanceof between App\Enums\PageTypeEnum and BackedEnum will always evaluate to true.
- [ ] **Line 58** (instanceof.alwaysTrue): Instanceof between App\Enums\PageBlockTypeEnum and BackedEnum will always evaluate to true.
- [ ] **Line 84** (arrayValues.list): Parameter #1 $array (list<array{id: 0, relation_type: 'blog_post', relation_id: mixed, relation_key: 'posts', position: int, metadata: null, data: mixed}>) of array_values is already a list, call has no effect.
- [ ] **Line 238** (nullsafe.neverNull): Using nullsafe property access "?->name" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 241** (ternary.alwaysTrue): Ternary operator condition is always true.
- [ ] **Line 361** (instanceof.alwaysFalse): Instanceof between string and BackedEnum will always evaluate to false.
## app/Http/Resources/Api/V1/ReturnResource.php
- [ ] **Line 27** (instanceof.alwaysFalse): Instanceof between string and App\Enums\ReturnTypeEnum will always evaluate to false.
- [ ] **Line 30** (instanceof.alwaysFalse): Instanceof between string and App\Enums\ReturnStatusEnum will always evaluate to false.
- [ ] **Line 38** (nullsafe.neverNull): Using nullsafe method call on non-nullable type Carbon\Carbon. Use -> instead.
- [ ] **Line 40** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<(int|string),Illuminate\Database\Eloquent\Model>::map() contains unresolvable type.
- [ ] **Line 41** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 42** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$condition.
- [ ] **Line 45** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$orderItem.
## app/Http/Resources/Api/V1/ShippingMethodResource.php
- [ ] **Line 33** (instanceof.alwaysTrue): Instanceof between App\Enums\ShippingCarrierEnum and App\Enums\ShippingCarrierEnum will always evaluate to true.
- [ ] **Line 45** (instanceof.alwaysTrue): Instanceof between App\Enums\ShippingCarrierEnum and BackedEnum will always evaluate to true.
- [ ] **Line 51** (instanceof.alwaysTrue): Instanceof between App\Enums\ShippingCarrierEnum and App\Enums\ShippingCarrierEnum will always evaluate to true.
## app/Http/Resources/Api/V1/WishlistResource.php
- [ ] **Line 31** (nullsafe.neverNull): Using nullsafe method call on non-nullable type App\Models\ProductVariant. Use -> instead.
- [ ] **Line 37** (booleanAnd.rightAlwaysTrue): Right side of && is always true.
- [ ] **Line 49** (nullCoalesce.property): Property Illuminate\Database\Eloquent\Model::$attributes (array<string, mixed>) on left side of ?? is not nullable.
## app/Infrastructure/Payments/BankTransferGateway.php
- [ ] **Line 30** (return.type): Method App\Infrastructure\Payments\BankTransferGateway::processPayment() should return array{action: 'none'|'redirect'|'wait', redirect_url: string|null, message: string} but returns array{action: 'none', bank_details: array{account_name: mixed, iban: mixed, swift: mixed, bank_name: mixed, reference: string, amount: int, currency: string}, message: 'Proszę dokonać…'}.
## app/Infrastructure/Payments/CashOnDeliveryGateway.php
- [ ] **Line 30** (return.type): Method App\Infrastructure\Payments\CashOnDeliveryGateway::processPayment() should return array{action: 'none'|'redirect'|'wait', redirect_url: string|null, message: string} but returns array{provider: 'cash_on_delivery', action: 'none', message: 'Płatność przy…'}.
## app/Infrastructure/Payments/P24/P24Gateway.php
- [ ] **Line 65** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 66** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 66** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 67** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 68** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 179** (booleanAnd.leftAlwaysTrue): Left side of && is always true.
- [ ] **Line 179** (notIdentical.alwaysTrue): Strict comparison using !== between App\States\Order\OrderState and App\Enums\OrderStatusEnum::PAID will always evaluate to true.
## app/Infrastructure/Payments/PayU/PayUGateway.php
- [ ] **Line 231** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 232** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 233** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 234** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 266** (booleanAnd.leftAlwaysTrue): Left side of && is always true.
- [ ] **Line 266** (notIdentical.alwaysTrue): Strict comparison using !== between App\States\Order\OrderState and App\Enums\OrderStatusEnum::PAID will always evaluate to true.
## app/Infrastructure/Payments/Paynow/PaynowGateway.php
- [ ] **Line 140** (booleanAnd.leftAlwaysTrue): Left side of && is always true.
- [ ] **Line 140** (notIdentical.alwaysTrue): Strict comparison using !== between App\States\Order\OrderState and App\Enums\OrderStatusEnum::PAID will always evaluate to true.
- [ ] **Line 161** (nullCoalesce.variable): Variable $billing on left side of ?? always exists and is not nullable.
- [ ] **Line 164** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 165** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Address. Use -> instead.
- [ ] **Line 166** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Address. Use -> instead.
- [ ] **Line 167** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Address. Use -> instead.
- [ ] **Line 169** (nullCoalesce.variable): Variable $billing on left side of ?? always exists and is not nullable.
- [ ] **Line 170** (nullCoalesce.variable): Variable $shipping on left side of ?? always exists and is not nullable.
## app/Infrastructure/Shipping/Furgonetka/FurgonetkaCarrier.php
- [ ] **Line 34** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 34** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 35** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Address. Use -> instead.
- [ ] **Line 36** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 37** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 38** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 39** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 40** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 41** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
## app/Infrastructure/Shipping/InPost/InPostLockerCarrier.php
- [ ] **Line 35** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 35** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 36** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Address. Use -> instead.
- [ ] **Line 37** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 38** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 40** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 42** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 43** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 44** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
## app/Infrastructure/Shipping/PickupCarrier.php
- [ ] **Line 20** (return.type): Method App\Infrastructure\Shipping\PickupCarrier::createShipment() should return App\Models\Shipment but returns Illuminate\Database\Eloquent\Model.
## app/Jobs/ProcessPaymentWebhook.php
- [ ] **Line 26** (property.onlyWritten): Property App\Jobs\ProcessPaymentWebhook::$rawBody is never read, only written.
- [ ] **Line 27** (property.onlyWritten): Property App\Jobs\ProcessPaymentWebhook::$signature is never read, only written.
## app/Jobs/SendAutomatedCampaignJob.php
- [ ] **Line 20** (property.onlyWritten): Property App\Jobs\SendAutomatedCampaignJob::$context is never read, only written.
## app/Listeners/SendFormSubmissionNotification.php
- [ ] **Line 16** (class.notFound): Parameter $event of method App\Listeners\SendFormSubmissionNotification::handle() has invalid type App\Modules\Forms\Domain\Events\FormSubmitted.
- [ ] **Line 18** (class.notFound): Access to property $form on an unknown class App\Modules\Forms\Domain\Events\FormSubmitted.
- [ ] **Line 27** (class.notFound): Access to property $form on an unknown class App\Modules\Forms\Domain\Events\FormSubmitted.
- [ ] **Line 27** (class.notFound): Access to property $submission on an unknown class App\Modules\Forms\Domain\Events\FormSubmitted.
- [ ] **Line 27** (class.notFound): Instantiated class App\Modules\Forms\Domain\Notifications\FormSubmissionNotification not found.
## app/Listeners/SendShippingNotification.php
- [ ] **Line 26** (nullsafe.neverNull): Using nullsafe property access "?->email" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 27** (nullsafe.neverNull): Using nullsafe property access "?->phone" on left side of ?? is unnecessary. Use -> instead.
## app/Models/Cart.php
- [ ] **Line 58** (argument.type): Parameter #1 $callback of method Illuminate\Support\Collection<(int|string),Illuminate\Database\Eloquent\Model>::sum() expects (callable(Illuminate\Database\Eloquent\Model, int|string): int)|string|null, Closure(App\Models\CartItem): int given.
- [ ] **Line 58** (ternary.alwaysTrue): Ternary operator condition is always true.
## app/Models/CmsMedia.php
- [ ] **Line 59** (method.notFound): Call to an undefined method Spatie\Image\Drivers\ImageDriver::nonQueued().
- [ ] **Line 66** (method.notFound): Call to an undefined method Spatie\Image\Drivers\ImageDriver::withResponsiveImages().
## app/Models/Currency.php
- [ ] **Line 74** (return.type): Method App\Models\Currency::latestRate() should return App\Models\ExchangeRate|null but returns Illuminate\Database\Eloquent\Model|null.
## app/Models/Customer.php
- [ ] **Line 105** (return.type): Method App\Models\Customer::defaultAddress() should return App\Models\Address|null but returns Illuminate\Database\Eloquent\Model|null.
## app/Models/Discount.php
- [ ] **Line 101** (booleanAnd.leftAlwaysTrue): Left side of && is always true.
## app/Models/NewsletterSubscriber.php
- [ ] **Line 86** (class.notFound): Class App\Modules\Core\Domain\Models\Customer not found.
- [ ] **Line 86** (argument.type): Parameter #1 $related of method Illuminate\Database\Eloquent\Model::belongsTo() expects class-string<Illuminate\Database\Eloquent\Model>, string given.
## app/Models/Order.php
- [ ] **Line 239** (throws.unusedType): Method App\Models\Order::enumToStateClass() has Spatie\ModelStates\Exceptions\TransitionNotAllowed in PHPDoc @throws tag but it's not thrown.
## app/Models/PageBlock.php
- [ ] **Line 101** (return.type): Method App\Models\PageBlock::getRelatedModels() should return Illuminate\Database\Eloquent\Collection but returns Illuminate\Support\Collection<(int|string), mixed>.
- [ ] **Line 108** (return.type): Method App\Models\PageBlock::getRelatedModels() should return Illuminate\Database\Eloquent\Collection but returns Illuminate\Support\Collection<(int|string), mixed>.
- [ ] **Line 113** (return.type): Method App\Models\PageBlock::getRelatedModels() should return Illuminate\Database\Eloquent\Collection but returns Illuminate\Support\Collection<(int|string), mixed>.
- [ ] **Line 130** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$relation_id.
- [ ] **Line 158** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,Illuminate\Database\Eloquent\Model>::map() contains unresolvable type.
- [ ] **Line 159** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$relation_id.
- [ ] **Line 163** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$metadata.
- [ ] **Line 164** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$position.
## app/Models/Payment.php
- [ ] **Line 68** (class.notFound): Call to static method base() on an unknown class App\Modules\Core\Domain\Models\Currency.
- [ ] **Line 68** (class.notFound): Call to static method query() on an unknown class App\Modules\Core\Domain\Models\Currency.
## app/Models/Product.php
- [ ] **Line 216** (return.type): Method App\Models\Product::getDefaultVariant() should return App\Models\ProductVariant|null but returns Illuminate\Database\Eloquent\Model|null.
- [ ] **Line 244** (nullCoalesce.expr): Expression on left side of ?? is not nullable.
- [ ] **Line 309** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Category. Use -> instead.
## app/Models/ProductBundle.php
- [ ] **Line 69** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$pivot.
- [ ] **Line 69** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$price.
## app/Models/ProductVariant.php
- [ ] **Line 154** (booleanAnd.rightAlwaysTrue): Right side of && is always true.
- [ ] **Line 230** (class.notFound): Call to static method base() on an unknown class App\Modules\Core\Domain\Models\Currency.
## app/Models/ReturnRequest.php
- [ ] **Line 96** (property.nonObject): Cannot access property $value on string.
## app/Models/ReviewHelpfulVote.php
- [ ] **Line 52** (class.notFound): Class App\Modules\Core\Domain\Models\Customer not found.
- [ ] **Line 52** (argument.type): Parameter #1 $related of method Illuminate\Database\Eloquent\Model::belongsTo() expects class-string<Illuminate\Database\Eloquent\Model>, string given.
## app/Models/Setting.php
- [ ] **Line 74** (argument.type): Parameter #1 $payload of static method Illuminate\Support\Facades\Crypt::decryptString() expects string, array<mixed> given.
- [ ] **Line 105** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Collection<int, App\Models\Setting>::mapWith().
## app/Models/ShippingMethod.php
- [ ] **Line 174** (instanceof.alwaysTrue): Instanceof between App\Enums\ShippingCarrierEnum and App\Enums\ShippingCarrierEnum will always evaluate to true.
## app/Models/ShippingZone.php
- [ ] **Line 60** (return.type): Method App\Models\ShippingZone::calculateShippingCost() should return int but returns float.
## app/Models/Subscription.php
- [ ] **Line 99** (method.nonObject): Cannot call method isActive() on string.
- [ ] **Line 104** (booleanAnd.alwaysFalse): Result of && is always false.
- [ ] **Line 104** (booleanAnd.alwaysFalse): Result of && is always false.
- [ ] **Line 104** (identical.alwaysFalse): Strict comparison using === between string and App\Enums\SubscriptionStatusEnum::Trial will always evaluate to false.
## app/Models/Wishlist.php
- [ ] **Line 53** (class.notFound): Class App\Modules\Core\Domain\Models\Customer not found.
- [ ] **Line 53** (argument.type): Parameter #1 $related of method Illuminate\Database\Eloquent\Model::belongsTo() expects class-string<Illuminate\Database\Eloquent\Model>, string given.
## app/Notifications/AbandonedCartNotification.php
- [ ] **Line 35** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 35** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant.
## app/Notifications/FormSubmissionNotification.php
- [ ] **Line 45** (nullsafe.neverNull): Using nullsafe property access "?->label" on left side of ?? is unnecessary. Use -> instead.
## app/Policies/PaymentPolicy.php
- [ ] **Line 26** (nullsafe.neverNull): Using nullsafe property access on non-nullable type App\Models\Order. Use -> instead.
## app/Policies/ReturnPolicy.php
- [ ] **Line 29** (booleanAnd.rightAlwaysTrue): Right side of && is always true.
## app/Queries/Admin/NewsletterSubscriberIndexQuery.php
- [ ] **Line 26** (larastan.relationExistence): Relation 'segments' is not found in App\Models\NewsletterSubscriber model.
## app/Queries/Admin/ProductIndexQuery.php
- [ ] **Line 51** (nullsafe.neverNull): Using nullsafe property access "?->price" on left side of ?? is unnecessary. Use -> instead.
- [ ] **Line 54** (ternary.alwaysTrue): Ternary operator condition is always true.
- [ ] **Line 58** (ternary.alwaysTrue): Ternary operator condition is always true.
## app/Queries/Admin/ProductReviewIndexQuery.php
- [ ] **Line 18** (larastan.relationExistence): Relation 'user' is not found in App\Models\ProductReview model.
- [ ] **Line 21** (larastan.relationExistence): Relation 'user' is not found in App\Models\ProductReview model.
## app/Queries/Admin/WishlistIndexQuery.php
- [ ] **Line 18** (larastan.relationExistence): Relation 'product' is not found in App\Models\Wishlist model.
- [ ] **Line 21** (larastan.relationExistence): Relation 'product' is not found in App\Models\Wishlist model.
## app/Services/Admin/Ecommerce/ProductService.php
- [ ] **Line 103** (return.type): Method App\Services\Admin\Ecommerce\ProductService::createVariant() should return App\Models\ProductVariant but returns Illuminate\Database\Eloquent\Model.
## app/Services/AnalyticsReportService.php
- [ ] **Line 117** (property.notFound): Access to an undefined property App\Models\Customer::$count.
- [ ] **Line 117** (property.notFound): Access to an undefined property App\Models\Customer::$date.
- [ ] **Line 157** (return.unusedType): Anonymous function never returns float so it can be removed from the return type.
- [ ] **Line 160** (return.unusedType): Anonymous function never returns float so it can be removed from the return type.
- [ ] **Line 240** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,App\Models\Order>::map() contains unresolvable type.
- [ ] **Line 241** (property.notFound): Access to an undefined property App\Models\Order::$month.
- [ ] **Line 242** (property.notFound): Access to an undefined property App\Models\Order::$vat.
- [ ] **Line 243** (property.notFound): Access to an undefined property App\Models\Order::$net.
- [ ] **Line 244** (property.notFound): Access to an undefined property App\Models\Order::$gross.
- [ ] **Line 245** (property.notFound): Access to an undefined property App\Models\Order::$count.
- [ ] **Line 254** (property.notFound): Access to an undefined property App\Models\Order::$vat_total.
## app/Services/BlockMediaResolver.php
- [ ] **Line 125** (parameterByRef.type): Parameter &$names by-ref type of method App\Services\BlockMediaResolver::collectMediaFields() expects array<int, string>, array<int, mixed> given.
## app/Services/CartService.php
- [ ] **Line 132** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant_id.
- [ ] **Line 134** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 138** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant_id.
- [ ] **Line 139** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
## app/Services/CheckoutService.php
- [ ] **Line 119** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant.
- [ ] **Line 126** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 175** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant.
- [ ] **Line 182** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 189** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$variant.
- [ ] **Line 194** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$quantity.
- [ ] **Line 204** (return.phpDocType): PHPDoc tag @return with type array<int, bool|int> is incompatible with native type App\Models\AffiliateCode|null.
## app/Services/CloneSiteService.php
- [ ] **Line 95** (argument.type): Parameter #2 $newSection of method App\Services\CloneSiteService::cloneBlocks() expects App\Models\PageSection, Illuminate\Database\Eloquent\Model given.
- [ ] **Line 112** (method.notFound): Call to an undefined method Illuminate\Database\Eloquent\Model::relations().
## app/Services/DashboardService.php
- [ ] **Line 200** (property.notFound): Access to an undefined property App\Models\Order::$count.
- [ ] **Line 200** (offsetAccess.invalidOffset): Invalid array key type App\States\Order\OrderState.
- [ ] **Line 239** (property.notFound): Access to an undefined property App\Models\Order::$date.
- [ ] **Line 239** (property.notFound): Access to an undefined property App\Models\Order::$revenue.
## app/Services/InvoiceService.php
- [ ] **Line 47** (assign.propertyType): Property App\Models\Order::$invoice_issued_at (Carbon\Carbon|null) does not accept Carbon\CarbonImmutable.
## app/Services/MarketingAutomationService.php
- [ ] **Line 62** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::OnSubscribe is always false.
- [ ] **Line 63** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::OnFirstOrder is always false.
- [ ] **Line 64** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::OnBirthday is always false.
- [ ] **Line 65** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::AfterPurchase is always false.
- [ ] **Line 66** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::CartAbandonment is always false.
- [ ] **Line 67** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::ProductReviewRequest is always false.
- [ ] **Line 68** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::WishlistBackInStock is always false.
- [ ] **Line 69** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::LoyaltyPointsEarned is always false.
- [ ] **Line 70** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::CategoryPurchased is always false.
- [ ] **Line 71** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::CustomerInactive is always false.
- [ ] **Line 72** (match.alwaysFalse): Match arm comparison between string and App\Enums\CampaignTriggerEnum::ProductPurchased is always false.
- [ ] **Line 135** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$customer.
## app/Services/MediaService.php
- [ ] **Line 54** (arguments.count): Method Illuminate\Filesystem\FilesystemAdapter::url() invoked with 2 parameters, 1 required.
- [ ] **Line 55** (arguments.count): Method Illuminate\Filesystem\FilesystemAdapter::url() invoked with 2 parameters, 1 required.
- [ ] **Line 56** (arguments.count): Method Illuminate\Filesystem\FilesystemAdapter::url() invoked with 2 parameters, 1 required.
## app/Services/PageVersionService.php
- [ ] **Line 28** (class.notFound): PHPDoc tag @var for variable $sections contains unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 28** (generics.notSubtype): Type App\Modules\Core\Domain\Models\PageSection in generic type Illuminate\Database\Eloquent\Collection<int, App\Modules\Core\Domain\Models\PageSection> in PHPDoc tag @var for variable $sections is not subtype of template type TModel of Illuminate\Database\Eloquent\Model of class Illuminate\Database\Eloquent\Collection.
- [ ] **Line 32** (argument.unresolvableType): Parameter #1 $callback of method Illuminate\Database\Eloquent\Collection<int,App\Modules\Core\Domain\Models\PageSection>::map() contains unresolvable type.
- [ ] **Line 33** (class.notFound): Call to method toArray() on an unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 34** (class.notFound): Call to method allBlocks() on an unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 105** (class.notFound): PHPDoc tag @var for variable $section contains unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 115** (class.notFound): Call to method allBlocks() on an unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 127** (class.notFound): PHPDoc tag @var for variable $section contains unknown class App\Modules\Core\Domain\Models\PageSection.
- [ ] **Line 135** (class.notFound): Call to method allBlocks() on an unknown class App\Modules\Core\Domain\Models\PageSection.
## app/Services/PromotionService.php
- [ ] **Line 33** (property.notFound): Access to an undefined property App\Models\Product|Illuminate\Database\Eloquent\Collection<int, App\Models\Product>::$price.
## app/Services/PushNotificationService.php
- [ ] **Line 25** (staticMethod.notFound): Call to an undefined static method Minishlink\WebPush\WebPush::createVapidKeys().
## app/Services/SmartCollectionService.php
- [ ] **Line 45** (return.type): Method App\Services\SmartCollectionService::getMatchingProducts() should return Illuminate\Database\Eloquent\Collection<int, App\Models\Product> but returns Illuminate\Database\Eloquent\Collection<int, Illuminate\Database\Eloquent\Model>.
## app/Services/SubscriptionService.php
- [ ] **Line 26** (argument.type): Parameter #1 $startDate of method App\Services\SubscriptionService::calculateExpirationDate() expects Carbon\Carbon, Carbon\CarbonImmutable given.
## app/Services/WishlistService.php
- [ ] **Line 35** (return.type): Method App\Services\WishlistService::getOrCreateWishlist() should return App\Models\Wishlist but returns Illuminate\Database\Eloquent\Model.
- [ ] **Line 41** (return.type): Method App\Services\WishlistService::getOrCreateWishlist() should return App\Models\Wishlist but returns Illuminate\Database\Eloquent\Model.
- [ ] **Line 127** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$items.
- [ ] **Line 132** (property.notFound): Access to an undefined property Illuminate\Database\Eloquent\Model::$id.
## app/Sorts/VariantPriceSort.php
- [ ] **Line 14** (generics.notGeneric): PHPDoc tag @implements contains generic type Spatie\QueryBuilder\Sorts\Sort<App\Models\Product> but interface Spatie\QueryBuilder\Sorts\Sort is not generic.
## app/Traits/ApiResponse.php
- [ ] **Line 10** (trait.unused): Trait App\Traits\ApiResponse is used zero times and is not analysed.
## config/media-library.php
- [ ] **Line 99** (class.notFound): Class Spatie\MediaLibraryPro\Models\TemporaryUpload not found.
## database/factories/NewsletterCampaignFactory.php
- [ ] **Line 46** (classConstant.notFound): Access to undefined constant App\Enums\CampaignStatusEnum::Active.
## database/seeders/ElectronicsSeeder.php
- [ ] **Line 909** (nullCoalesce.offset): Offset 32|43|50|55|65|75|85|86 on array{55: 'Telewizory 55 cali', 65: 'Telewizory 65 cali', 75: 'Telewizory 75 cali', 43: 'Telewizory 43 cale', 50: 'Telewizory 50 cali', 32: 'Telewizory 32 cale', 85: 'Telewizory 85 cali…', 86: 'Telewizory 85 cali…'} on left side of ?? always exists and is not nullable.

**Total Errors**: 343
