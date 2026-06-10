<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int|null $customer_id
 * @property AddressTypeEnum $type
 * @property string $first_name
 * @property string $last_name
 * @property string|null $company_name
 * @property string $street
 * @property string|null $street2
 * @property string $city
 * @property string $postal_code
 * @property string $country_code
 * @property string $phone
 * @property bool $is_default
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @method static AddressFactory factory($count = null, $state = [])
 * @method static AddressBuilder<static>|Address newModelQuery()
 * @method static AddressBuilder<static>|Address newQuery()
 * @method static AddressBuilder<static>|Address query()
 * @method static AddressBuilder<static>|Address findMatchingAddress(int $customerId, AddressTypeEnum $type, array $mapped)
 * @method static AddressBuilder<static>|Address whereCity($value)
 * @method static AddressBuilder<static>|Address whereCompanyName($value)
 * @method static AddressBuilder<static>|Address whereCountryCode($value)
 * @method static AddressBuilder<static>|Address whereCreatedAt($value)
 * @method static AddressBuilder<static>|Address whereCustomerId($value)
 * @method static AddressBuilder<static>|Address whereFirstName($value)
 * @method static AddressBuilder<static>|Address whereId($value)
 * @method static AddressBuilder<static>|Address whereIsDefault($value)
 * @method static AddressBuilder<static>|Address whereLastName($value)
 * @method static AddressBuilder<static>|Address wherePhone($value)
 * @method static AddressBuilder<static>|Address wherePostalCode($value)
 * @method static AddressBuilder<static>|Address whereStreet($value)
 * @method static AddressBuilder<static>|Address whereStreet2($value)
 * @method static AddressBuilder<static>|Address whereType($value)
 * @method static AddressBuilder<static>|Address whereUpdatedAt($value)
 * @mixin Model
 */
	class Address extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $code
 * @property string $discount_type
 * @property int $discount_value Percentage (0-100) or fixed amount in cents
 * @property numeric $commission_rate Commission percentage paid to affiliate
 * @property int|null $max_uses null = unlimited
 * @property int $uses_count
 * @property bool $is_active
 * @property CarbonImmutable|null $expires_at
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Referral> $referrals
 * @property-read int|null $referrals_count
 * @property-read User|null $user
 * @method static Builder<static>|AffiliateCode newModelQuery()
 * @method static Builder<static>|AffiliateCode newQuery()
 * @method static Builder<static>|AffiliateCode query()
 * @method static Builder<static>|AffiliateCode whereCode($value)
 * @method static Builder<static>|AffiliateCode whereCommissionRate($value)
 * @method static Builder<static>|AffiliateCode whereCreatedAt($value)
 * @method static Builder<static>|AffiliateCode whereDiscountType($value)
 * @method static Builder<static>|AffiliateCode whereDiscountValue($value)
 * @method static Builder<static>|AffiliateCode whereExpiresAt($value)
 * @method static Builder<static>|AffiliateCode whereId($value)
 * @method static Builder<static>|AffiliateCode whereIsActive($value)
 * @method static Builder<static>|AffiliateCode whereMaxUses($value)
 * @method static Builder<static>|AffiliateCode whereNotes($value)
 * @method static Builder<static>|AffiliateCode whereUpdatedAt($value)
 * @method static Builder<static>|AffiliateCode whereUserId($value)
 * @method static Builder<static>|AffiliateCode whereUsesCount($value)
 * @mixin Model
 */
	class AffiliateCode extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $session_id
 * @property string $event_name
 * @property int|null $product_id
 * @property int|null $product_variant_id
 * @property string|null $url
 * @property string|null $referrer
 * @property array<array-key, mixed>|null $metadata
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\ProductVariant|null $productVariant
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereEventName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereProductVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereReferrer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereUrl($value)
 */
	final class AnalyticsEvent extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property NotificationTypeEnum $type
 * @property NotificationChannelEnum $channel
 * @property NotificationStatusEnum $status
 * @property string|null $related_model
 * @property int|null $related_model_id
 * @property array<string, mixed>|null $metadata
 * @property string|null $error_message
 * @property Carbon|null $sent_at
 * @property Carbon|null $failed_at
 * @property-read Customer|null $customer
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|AppNotification newModelQuery()
 * @method static Builder<static>|AppNotification newQuery()
 * @method static Builder<static>|AppNotification query()
 * @method static Builder<static>|AppNotification whereChannel($value)
 * @method static Builder<static>|AppNotification whereCreatedAt($value)
 * @method static Builder<static>|AppNotification whereCustomerId($value)
 * @method static Builder<static>|AppNotification whereErrorMessage($value)
 * @method static Builder<static>|AppNotification whereFailedAt($value)
 * @method static Builder<static>|AppNotification whereId($value)
 * @method static Builder<static>|AppNotification whereMetadata($value)
 * @method static Builder<static>|AppNotification whereRelatedModel($value)
 * @method static Builder<static>|AppNotification whereRelatedModelId($value)
 * @method static Builder<static>|AppNotification whereSentAt($value)
 * @method static Builder<static>|AppNotification whereStatus($value)
 * @method static Builder<static>|AppNotification whereType($value)
 * @method static Builder<static>|AppNotification whereUpdatedAt($value)
 * @mixin Model
 */
	class AppNotification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property AttributeTypeEnum $type
 * @property string|null $unit
 * @property bool $is_filterable
 * @property bool $is_variant_selection
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ProductType> $productTypes
 * @property-read int|null $product_types_count
 * @property-read Collection<int, AttributeValue> $values
 * @property-read int|null $values_count
 * @method static AttributeFactory factory($count = null, $state = [])
 * @method static Builder<static>|Attribute newModelQuery()
 * @method static Builder<static>|Attribute newQuery()
 * @method static Builder<static>|Attribute query()
 * @method static Builder<static>|Attribute whereCreatedAt($value)
 * @method static Builder<static>|Attribute whereId($value)
 * @method static Builder<static>|Attribute whereIsFilterable($value)
 * @method static Builder<static>|Attribute whereIsVariantSelection($value)
 * @method static Builder<static>|Attribute whereName($value)
 * @method static Builder<static>|Attribute wherePosition($value)
 * @method static Builder<static>|Attribute whereSlug($value)
 * @method static Builder<static>|Attribute whereType($value)
 * @method static Builder<static>|Attribute whereUnit($value)
 * @method static Builder<static>|Attribute whereUpdatedAt($value)
 * @mixin Model
 */
	class Attribute extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $attribute_id
 * @property string $value
 * @property string $slug
 * @property string|null $color_hex
 * @property int $position
 * @property-read Attribute $attribute
 * @method static AttributeValueFactory factory($count = null, $state = [])
 * @method static Builder<static>|AttributeValue newModelQuery()
 * @method static Builder<static>|AttributeValue newQuery()
 * @method static Builder<static>|AttributeValue query()
 * @method static Builder<static>|AttributeValue whereAttributeId($value)
 * @method static Builder<static>|AttributeValue whereColorHex($value)
 * @method static Builder<static>|AttributeValue whereId($value)
 * @method static Builder<static>|AttributeValue wherePosition($value)
 * @method static Builder<static>|AttributeValue whereSlug($value)
 * @method static Builder<static>|AttributeValue whereValue($value)
 * @mixin Model
 */
	class AttributeValue extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $page_block_id
 * @property string $relation_type
 * @property int $relation_id
 * @property string|null $relation_key
 * @property int $position
 * @property array|null $metadata
 * @property-read PageBlock $block
 * @property-read Model $related
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|BlockRelation newModelQuery()
 * @method static Builder<static>|BlockRelation newQuery()
 * @method static Builder<static>|BlockRelation ofType(string $type)
 * @method static Builder<static>|BlockRelation ordered()
 * @method static Builder<static>|BlockRelation query()
 * @method static Builder<static>|BlockRelation whereCreatedAt($value)
 * @method static Builder<static>|BlockRelation whereId($value)
 * @method static Builder<static>|BlockRelation whereMetadata($value)
 * @method static Builder<static>|BlockRelation wherePageBlockId($value)
 * @method static Builder<static>|BlockRelation wherePosition($value)
 * @method static Builder<static>|BlockRelation whereRelationId($value)
 * @method static Builder<static>|BlockRelation whereRelationKey($value)
 * @method static Builder<static>|BlockRelation whereRelationType($value)
 * @method static Builder<static>|BlockRelation whereUpdatedAt($value)
 * @method static Builder<static>|BlockRelation withKey(string $key)
 * @mixin Model
 */
	class BlockRelation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property array<array-key, mixed> $name
 * @property array<array-key, mixed>|null $slug
 * @property array<array-key, mixed>|null $description
 * @property string $layout
 * @property bool $commentable
 * @property int|null $default_author_id
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property bool $is_active
 * @property array<array-key, mixed>|null $available_locales
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $defaultAuthor
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, BlogPost> $posts
 * @property-read int|null $posts_count
 * @property-read Collection<int, BlogPost> $publishedPosts
 * @property-read int|null $published_posts_count
 * @property-read mixed $translations
 * @method static Builder<static>|Blog active()
 * @method static BlogFactory factory($count = null, $state = [])
 * @method static Builder<static>|Blog newModelQuery()
 * @method static Builder<static>|Blog newQuery()
 * @method static Builder<static>|Blog query()
 * @method static Builder<static>|Blog whereAvailableLocales($value)
 * @method static Builder<static>|Blog whereCommentable($value)
 * @method static Builder<static>|Blog whereCreatedAt($value)
 * @method static Builder<static>|Blog whereDefaultAuthorId($value)
 * @method static Builder<static>|Blog whereDescription($value)
 * @method static Builder<static>|Blog whereId($value)
 * @method static Builder<static>|Blog whereIsActive($value)
 * @method static Builder<static>|Blog whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Blog whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Blog whereLayout($value)
 * @method static Builder<static>|Blog whereLocale(string $column, string $locale)
 * @method static Builder<static>|Blog whereLocales(string $column, array $locales)
 * @method static Builder<static>|Blog whereName($value)
 * @method static Builder<static>|Blog wherePosition($value)
 * @method static Builder<static>|Blog wherePostsPerPage($value)
 * @method static Builder<static>|Blog whereSeoDescription($value)
 * @method static Builder<static>|Blog whereSeoTitle($value)
 * @method static Builder<static>|Blog whereSlug($value)
 * @method static Builder<static>|Blog whereUpdatedAt($value)
 * @mixin Model
 */
	class Blog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int|null $parent_id
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, BlogCategory> $children
 * @property-read int|null $children_count
 * @property-read BlogCategory|null $parent
 * @property-read Collection<int, BlogPost> $posts
 * @property-read int|null $posts_count
 * @method static Builder<static>|BlogCategory active()
 * @method static BlogCategoryFactory factory($count = null, $state = [])
 * @method static Builder<static>|BlogCategory newModelQuery()
 * @method static Builder<static>|BlogCategory newQuery()
 * @method static Builder<static>|BlogCategory query()
 * @method static Builder<static>|BlogCategory roots()
 * @method static Builder<static>|BlogCategory whereCreatedAt($value)
 * @method static Builder<static>|BlogCategory whereDescription($value)
 * @method static Builder<static>|BlogCategory whereId($value)
 * @method static Builder<static>|BlogCategory whereIsActive($value)
 * @method static Builder<static>|BlogCategory whereName($value)
 * @method static Builder<static>|BlogCategory whereParentId($value)
 * @method static Builder<static>|BlogCategory wherePosition($value)
 * @method static Builder<static>|BlogCategory whereSlug($value)
 * @method static Builder<static>|BlogCategory whereUpdatedAt($value)
 * @mixin Model
 */
	class BlogCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $blog_post_id
 * @property int $user_id
 * @property int|null $parent_id
 * @property string $body
 * @property bool $is_approved
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read BlogComment|null $parent
 * @property-read BlogPost $post
 * @property-read Collection<int, BlogComment> $replies
 * @property-read int|null $replies_count
 * @property-read User|null $user
 * @method static Builder<static>|BlogComment newModelQuery()
 * @method static Builder<static>|BlogComment newQuery()
 * @method static Builder<static>|BlogComment query()
 * @method static Builder<static>|BlogComment whereBlogPostId($value)
 * @method static Builder<static>|BlogComment whereBody($value)
 * @method static Builder<static>|BlogComment whereCreatedAt($value)
 * @method static Builder<static>|BlogComment whereId($value)
 * @method static Builder<static>|BlogComment whereIsApproved($value)
 * @method static Builder<static>|BlogComment whereParentId($value)
 * @method static Builder<static>|BlogComment whereUpdatedAt($value)
 * @method static Builder<static>|BlogComment whereUserId($value)
 * @mixin Model
 */
	class BlogComment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property array<string, string>|string $title
 * @property array<string, string>|string $slug
 * @property array<string, string>|null $slug_translations
 * @property array<string, string>|string|null $content
 * @property array<string, string>|string|null $excerpt
 * @property array<string, mixed>|null $content_json
 * @property BlogPostStatusEnum|string|null $status
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $canonical_url
 * @property int|null $reading_time
 * @property string|null $translation_group_id
 * @property array<string, string>|null $available_locales
 * @property bool $is_featured
 * @property Carbon|null $published_at
 * @property string|null $featured_image
 * @property Carbon|null $created_at
 * @property User|null $author
 * @property int|null $blog_id
 * @property int|null $user_id
 * @property int|null $blog_category_id
 * @property string $content_type
 * @property int $views_count
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Blog|null $blog
 * @property-read BlogCategory|null $category
 * @property int|null $votes_up_count
 * @property int|null $votes_down_count
 * @property-read Collection<int, BlogComment> $comments
 * @property-read int|null $comments_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 * @property-read Collection<int, BlogPostVote> $votes
 * @property-read int|null $votes_count
 * @method static Builder<static>|BlogPost draft()
 * @method static BlogPostFactory factory($count = null, $state = [])
 * @method static Builder<static>|BlogPost featured()
 * @method static Builder<static>|BlogPost newModelQuery()
 * @method static Builder<static>|BlogPost newQuery()
 * @method static Builder<static>|BlogPost published()
 * @method static Builder<static>|BlogPost query()
 * @method static Builder<static>|BlogPost whereAvailableLocales($value)
 * @method static Builder<static>|BlogPost whereBlogCategoryId($value)
 * @method static Builder<static>|BlogPost whereBlogId($value)
 * @method static Builder<static>|BlogPost whereCanonicalUrl($value)
 * @method static Builder<static>|BlogPost whereContent($value)
 * @method static Builder<static>|BlogPost whereContentJson($value)
 * @method static Builder<static>|BlogPost whereContentType($value)
 * @method static Builder<static>|BlogPost whereCreatedAt($value)
 * @method static Builder<static>|BlogPost whereExcerpt($value)
 * @method static Builder<static>|BlogPost whereFeaturedImage($value)
 * @method static Builder<static>|BlogPost whereId($value)
 * @method static Builder<static>|BlogPost whereIsFeatured($value)
 * @method static Builder<static>|BlogPost whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|BlogPost whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|BlogPost whereLocale(string $column, string $locale)
 * @method static Builder<static>|BlogPost whereLocales(string $column, array $locales)
 * @method static Builder<static>|BlogPost whereMetaRobots($value)
 * @method static Builder<static>|BlogPost whereOgImage($value)
 * @method static Builder<static>|BlogPost wherePublishedAt($value)
 * @method static Builder<static>|BlogPost whereReadingTime($value)
 * @method static Builder<static>|BlogPost whereSeoDescription($value)
 * @method static Builder<static>|BlogPost whereSeoTitle($value)
 * @method static Builder<static>|BlogPost whereSitemapExclude($value)
 * @method static Builder<static>|BlogPost whereSlug($value)
 * @method static Builder<static>|BlogPost whereStatus($value)
 * @method static Builder<static>|BlogPost whereTitle($value)
 * @method static Builder<static>|BlogPost whereTranslationGroupId($value)
 * @method static Builder<static>|BlogPost whereUpdatedAt($value)
 * @method static Builder<static>|BlogPost whereUserId($value)
 * @method static Builder<static>|BlogPost whereViewsCount($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class BlogPost extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $blog_post_id
 * @property string $ip_hash
 * @property CarbonImmutable $viewed_at
 * @property-read BlogPost $post
 * @method static Builder<static>|BlogPostView newModelQuery()
 * @method static Builder<static>|BlogPostView newQuery()
 * @method static Builder<static>|BlogPostView query()
 * @method static Builder<static>|BlogPostView whereBlogPostId($value)
 * @method static Builder<static>|BlogPostView whereId($value)
 * @method static Builder<static>|BlogPostView whereIpHash($value)
 * @method static Builder<static>|BlogPostView whereViewedAt($value)
 * @mixin Model
 */
	class BlogPostView extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $blog_post_id
 * @property int $user_id
 * @property string $vote
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read BlogPost $post
 * @property-read User|null $user
 * @method static Builder<static>|BlogPostVote newModelQuery()
 * @method static Builder<static>|BlogPostVote newQuery()
 * @method static Builder<static>|BlogPostVote query()
 * @method static Builder<static>|BlogPostVote whereBlogPostId($value)
 * @method static Builder<static>|BlogPostVote whereCreatedAt($value)
 * @method static Builder<static>|BlogPostVote whereId($value)
 * @method static Builder<static>|BlogPostVote whereUpdatedAt($value)
 * @method static Builder<static>|BlogPostVote whereUserId($value)
 * @method static Builder<static>|BlogPostVote whereVote($value)
 * @mixin Model
 */
	class BlogPostVote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $logo_path
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @method static Builder<static>|Brand newModelQuery()
 * @method static Builder<static>|Brand newQuery()
 * @method static Builder<static>|Brand onlyTrashed()
 * @method static Builder<static>|Brand query()
 * @method static Builder<static>|Brand whereCreatedAt($value)
 * @method static Builder<static>|Brand whereDeletedAt($value)
 * @method static Builder<static>|Brand whereDescription($value)
 * @method static Builder<static>|Brand whereId($value)
 * @method static Builder<static>|Brand whereIsActive($value)
 * @method static Builder<static>|Brand whereLogoPath($value)
 * @method static Builder<static>|Brand whereName($value)
 * @method static Builder<static>|Brand wherePosition($value)
 * @method static Builder<static>|Brand whereSlug($value)
 * @method static Builder<static>|Brand whereUpdatedAt($value)
 * @method static Builder<static>|Brand withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Brand withoutTrashed()
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Brand extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $session_token
 * @property Collection<int, CartItem> $items
 * @property int|null $customer_id
 * @property string|null $discount_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read int|null $items_count
 * @method static CartFactory factory($count = null, $state = [])
 * @method static Builder<static>|Cart newModelQuery()
 * @method static Builder<static>|Cart newQuery()
 * @method static Builder<static>|Cart query()
 * @method static Builder<static>|Cart whereCreatedAt($value)
 * @method static Builder<static>|Cart whereCustomerId($value)
 * @method static Builder<static>|Cart whereDiscountCode($value)
 * @method static Builder<static>|Cart whereId($value)
 * @method static Builder<static>|Cart whereSessionToken($value)
 * @method static Builder<static>|Cart whereUpdatedAt($value)
 * @mixin Model
 */
	class Cart extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $cart_id
 * @property int $variant_id
 * @property int $quantity
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Cart $cart
 * @property-read ProductVariant $variant
 * @method static CartItemFactory factory($count = null, $state = [])
 * @method static Builder<static>|CartItem newModelQuery()
 * @method static Builder<static>|CartItem newQuery()
 * @method static Builder<static>|CartItem query()
 * @method static Builder<static>|CartItem whereCartId($value)
 * @method static Builder<static>|CartItem whereCreatedAt($value)
 * @method static Builder<static>|CartItem whereId($value)
 * @method static Builder<static>|CartItem whereQuantity($value)
 * @method static Builder<static>|CartItem whereUpdatedAt($value)
 * @method static Builder<static>|CartItem whereVariantId($value)
 * @mixin Model
 */
	class CartItem extends \Eloquent {}
}

namespace App\Models{
/**
 * Category Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property array<string, string>|string $name
 * @property array<string, string>|string $slug
 * @property array<string, string>|string|null $description
 * @property bool $is_active
 * @property string|null $collection_type
 * @property int|null $parent_id
 * @property string|null $image_path
 * @property Carbon|null $created_at
 * @property int|null $product_type_id
 * @property array<array-key, mixed>|null $rules
 * @property string $rules_match
 * @property int $position
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $canonical_url
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $allChildren
 * @property-read int|null $all_children_count
 * @property-read Collection<int, Category> $children
 * @property-read int|null $children_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read Category|null $parent
 * @property-read ProductType|null $productType
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read TaxRate|null $taxRate
 * @property-read mixed $translations
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 * @method static CategoryFactory factory($count = null, $state = [])
 * @method static Builder<static>|Category newModelQuery()
 * @method static Builder<static>|Category newQuery()
 * @method static Builder<static>|Category query()
 * @method static Builder<static>|Category whereCanonicalUrl($value)
 * @method static Builder<static>|Category whereCollectionType($value)
 * @method static Builder<static>|Category whereCreatedAt($value)
 * @method static Builder<static>|Category whereDescription($value)
 * @method static Builder<static>|Category whereId($value)
 * @method static Builder<static>|Category whereImagePath($value)
 * @method static Builder<static>|Category whereIsActive($value)
 * @method static Builder<static>|Category whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Category whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Category whereLocale(string $column, string $locale)
 * @method static Builder<static>|Category whereLocales(string $column, array $locales)
 * @method static Builder<static>|Category whereMetaRobots($value)
 * @method static Builder<static>|Category whereName($value)
 * @method static Builder<static>|Category whereOgImage($value)
 * @method static Builder<static>|Category whereParentId($value)
 * @method static Builder<static>|Category wherePosition($value)
 * @method static Builder<static>|Category whereProductTypeId($value)
 * @method static Builder<static>|Category whereRules($value)
 * @method static Builder<static>|Category whereRulesMatch($value)
 * @method static Builder<static>|Category whereSeoDescription($value)
 * @method static Builder<static>|Category whereSeoTitle($value)
 * @method static Builder<static>|Category whereSitemapExclude($value)
 * @method static Builder<static>|Category whereSlug($value)
 * @method static Builder<static>|Category whereUpdatedAt($value)
 * @mixin Model
 * @property int|null $tax_rate_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereTaxRateId($value)
 */
	class Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @method static Builder<static>|CmsMedia newModelQuery()
 * @method static Builder<static>|CmsMedia newQuery()
 * @method static Builder<static>|CmsMedia query()
 * @method static Builder<static>|CmsMedia whereCreatedAt($value)
 * @method static Builder<static>|CmsMedia whereId($value)
 * @method static Builder<static>|CmsMedia whereUpdatedAt($value)
 * @mixin Model
 */
	class CmsMedia extends \Eloquent implements \Spatie\MediaLibrary\HasMedia {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $content
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|ContentEntry newModelQuery()
 * @method static Builder<static>|ContentEntry newQuery()
 * @method static Builder<static>|ContentEntry query()
 * @method static Builder<static>|ContentEntry whereContent($value)
 * @method static Builder<static>|ContentEntry whereCreatedAt($value)
 * @method static Builder<static>|ContentEntry whereId($value)
 * @method static Builder<static>|ContentEntry whereIsActive($value)
 * @method static Builder<static>|ContentEntry whereName($value)
 * @method static Builder<static>|ContentEntry whereUpdatedAt($value)
 * @mixin Model
 */
	class ContentEntry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property bool $granted
 * @property string $consent_version
 * @property string|null $session_id
 * @property int|null $user_id
 * @property string $category
 * @property string|null $ip
 * @property string|null $user_agent
 * @property array<string, mixed>|null $policy_version_snapshot
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static CookieConsentFactory factory($count = null, $state = [])
 * @method static Builder<static>|CookieConsent newModelQuery()
 * @method static Builder<static>|CookieConsent newQuery()
 * @method static Builder<static>|CookieConsent query()
 * @method static Builder<static>|CookieConsent whereCategory($value)
 * @method static Builder<static>|CookieConsent whereConsentVersion($value)
 * @method static Builder<static>|CookieConsent whereCreatedAt($value)
 * @method static Builder<static>|CookieConsent whereGranted($value)
 * @method static Builder<static>|CookieConsent whereId($value)
 * @method static Builder<static>|CookieConsent whereIp($value)
 * @method static Builder<static>|CookieConsent whereSessionId($value)
 * @method static Builder<static>|CookieConsent whereUpdatedAt($value)
 * @method static Builder<static>|CookieConsent whereUserAgent($value)
 * @method static Builder<static>|CookieConsent whereUserId($value)
 * @mixin Model
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent wherePolicyVersionSnapshot($value)
 */
	class CookieConsent extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $symbol
 * @property int $decimal_places
 * @property bool $is_active
 * @property bool $is_base
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ExchangeRate> $exchangeRates
 * @property-read int|null $exchange_rates_count
 * @method static CurrencyFactory factory($count = null, $state = [])
 * @method static Builder<static>|Currency newModelQuery()
 * @method static Builder<static>|Currency newQuery()
 * @method static Builder<static>|Currency query()
 * @method static Builder<static>|Currency whereCode($value)
 * @method static Builder<static>|Currency whereCreatedAt($value)
 * @method static Builder<static>|Currency whereDecimalPlaces($value)
 * @method static Builder<static>|Currency whereId($value)
 * @method static Builder<static>|Currency whereIsActive($value)
 * @method static Builder<static>|Currency whereIsBase($value)
 * @method static Builder<static>|Currency whereName($value)
 * @method static Builder<static>|Currency whereSymbol($value)
 * @method static Builder<static>|Currency whereUpdatedAt($value)
 * @mixin Model
 */
	class Currency extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $data_source
 * @property array $metrics
 * @property array $dimensions
 * @property array $filters
 * @property string $chart_type
 * @property int $user_id
 * @property string|null $description
 * @property array<array-key, mixed>|null $group_by
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $user
 * @method static CustomReportFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomReport newModelQuery()
 * @method static Builder<static>|CustomReport newQuery()
 * @method static Builder<static>|CustomReport query()
 * @method static Builder<static>|CustomReport whereChartType($value)
 * @method static Builder<static>|CustomReport whereCreatedAt($value)
 * @method static Builder<static>|CustomReport whereDataSource($value)
 * @method static Builder<static>|CustomReport whereDescription($value)
 * @method static Builder<static>|CustomReport whereDimensions($value)
 * @method static Builder<static>|CustomReport whereFilters($value)
 * @method static Builder<static>|CustomReport whereGroupBy($value)
 * @method static Builder<static>|CustomReport whereId($value)
 * @method static Builder<static>|CustomReport whereIsPublic($value)
 * @method static Builder<static>|CustomReport whereMetrics($value)
 * @method static Builder<static>|CustomReport whereName($value)
 * @method static Builder<static>|CustomReport whereUpdatedAt($value)
 * @method static Builder<static>|CustomReport whereUserId($value)
 * @mixin Model
 */
	final class CustomReport extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property Carbon|null $birth_date
 * @property User|null $user
 * @property int $user_id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string $customer_type
 * @property string|null $company_name
 * @property string|null $tax_id
 * @property bool $is_tax_exempt
 * @property string|null $notes
 * @property array<array-key, mixed>|null $tags
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Address> $addresses
 * @property-read int|null $addresses_count
 * @property-read Cart|null $cart
 * @property-read NewsletterSubscriber|null $newsletterSubscriber
 * @property-read Collection<int, Order> $orders
 * @property-read int|null $orders_count
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read int|null $reviews_count
 * @property-read Collection<int, Wishlist> $wishlists
 * @property-read int|null $wishlists_count
 * @method static CustomerFactory factory($count = null, $state = [])
 * @method static Builder<static>|Customer newModelQuery()
 * @method static Builder<static>|Customer newQuery()
 * @method static Builder<static>|Customer onlyTrashed()
 * @method static Builder<static>|Customer query()
 * @method static Builder<static>|Customer whereCompanyName($value)
 * @method static Builder<static>|Customer whereCreatedAt($value)
 * @method static Builder<static>|Customer whereDeletedAt($value)
 * @method static Builder<static>|Customer whereEmail($value)
 * @method static Builder<static>|Customer whereFirstName($value)
 * @method static Builder<static>|Customer whereId($value)
 * @method static Builder<static>|Customer whereIsActive($value)
 * @method static Builder<static>|Customer whereLastName($value)
 * @method static Builder<static>|Customer whereNotes($value)
 * @method static Builder<static>|Customer wherePhone($value)
 * @method static Builder<static>|Customer whereTags($value)
 * @method static Builder<static>|Customer whereTaxId($value)
 * @method static Builder<static>|Customer whereUpdatedAt($value)
 * @method static Builder<static>|Customer whereUserId($value)
 * @method static Builder<static>|Customer withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Customer withoutTrashed()
 * @mixin Model
 * @property bool $sms_notifications Whether the customer opted in for SMS status updates
 * @property \Carbon\CarbonImmutable|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereBirthDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereCustomerType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereIsTaxExempt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereSmsNotifications($value)
 */
	class Customer extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int|null $user_id
 * @property string $type
 * @property string $title
 * @property string $body
 * @property array|null $data
 * @property Carbon|null $read_at
 * @property string|null $action_url
 * @property Carbon|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read User|null $user
 * @method static CustomerNotificationFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomerNotification newModelQuery()
 * @method static Builder<static>|CustomerNotification newQuery()
 * @method static Builder<static>|CustomerNotification query()
 * @method static Builder<static>|CustomerNotification unread()
 * @method static Builder<static>|CustomerNotification whereActionUrl($value)
 * @method static Builder<static>|CustomerNotification whereBody($value)
 * @method static Builder<static>|CustomerNotification whereCreatedAt($value)
 * @method static Builder<static>|CustomerNotification whereCustomerId($value)
 * @method static Builder<static>|CustomerNotification whereData($value)
 * @method static Builder<static>|CustomerNotification whereId($value)
 * @method static Builder<static>|CustomerNotification whereReadAt($value)
 * @method static Builder<static>|CustomerNotification whereTitle($value)
 * @method static Builder<static>|CustomerNotification whereType($value)
 * @method static Builder<static>|CustomerNotification whereUpdatedAt($value)
 * @method static Builder<static>|CustomerNotification whereUserId($value)
 * @mixin Model
 */
	final class CustomerNotification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $rules
 * @property-read int|null $customers_count
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Customer> $customers
 * @method static CustomerSegmentFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomerSegment newModelQuery()
 * @method static Builder<static>|CustomerSegment newQuery()
 * @method static Builder<static>|CustomerSegment query()
 * @method static Builder<static>|CustomerSegment whereCreatedAt($value)
 * @method static Builder<static>|CustomerSegment whereCustomersCount($value)
 * @method static Builder<static>|CustomerSegment whereDescription($value)
 * @method static Builder<static>|CustomerSegment whereId($value)
 * @method static Builder<static>|CustomerSegment whereIsActive($value)
 * @method static Builder<static>|CustomerSegment whereName($value)
 * @method static Builder<static>|CustomerSegment whereRules($value)
 * @method static Builder<static>|CustomerSegment whereType($value)
 * @method static Builder<static>|CustomerSegment whereUpdatedAt($value)
 * @mixin Model
 */
	class CustomerSegment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $title
 * @property WidgetType $type
 * @property WidgetSize $size
 * @property int $order
 * @property bool $is_active
 * @property array<array-key, mixed>|null $config
 * @property array<array-key, mixed>|null $permissions
 * @property string|null $icon
 * @property string|null $color
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|DashboardWidget active()
 * @method static Builder<static>|DashboardWidget newModelQuery()
 * @method static Builder<static>|DashboardWidget newQuery()
 * @method static Builder<static>|DashboardWidget ordered()
 * @method static Builder<static>|DashboardWidget query()
 * @method static Builder<static>|DashboardWidget whereColor($value)
 * @method static Builder<static>|DashboardWidget whereConfig($value)
 * @method static Builder<static>|DashboardWidget whereCreatedAt($value)
 * @method static Builder<static>|DashboardWidget whereIcon($value)
 * @method static Builder<static>|DashboardWidget whereId($value)
 * @method static Builder<static>|DashboardWidget whereIsActive($value)
 * @method static Builder<static>|DashboardWidget whereOrder($value)
 * @method static Builder<static>|DashboardWidget wherePermissions($value)
 * @method static Builder<static>|DashboardWidget whereSize($value)
 * @method static Builder<static>|DashboardWidget whereTitle($value)
 * @method static Builder<static>|DashboardWidget whereType($value)
 * @method static Builder<static>|DashboardWidget whereUpdatedAt($value)
 * @mixin Model
 */
	class DashboardWidget extends \Eloquent {}
}

namespace App\Models\Dashboard{
/**
 * @method static Builder<static>|DashboardStats newModelQuery()
 * @method static Builder<static>|DashboardStats newQuery()
 * @method static Builder<static>|DashboardStats query()
 * @mixin \Eloquent
 */
	class DashboardStats extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $code
 * @property string $name
 * @property string $type
 * @property int $value
 * @property string $apply_to
 * @property int|null $min_order_value
 * @property int|null $max_uses
 * @property int $uses_count
 * @property int|null $max_uses_per_customer
 * @property CarbonImmutable|null $starts_at
 * @property CarbonImmutable|null $ends_at
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property int $is_stackable
 * @property int $apply_to_discounted_products
 * @property int $is_auto_apply
 * @property int $priority
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, DiscountCondition> $conditions
 * @property-read int|null $conditions_count
 * @property-read Collection<int, Product> $products
 * @property-read Collection<int, Category> $categories
 * @method static DiscountFactory factory($count = null, $state = [])
 * @method static Builder<static>|Discount newModelQuery()
 * @method static Builder<static>|Discount newQuery()
 * @method static Builder<static>|Discount query()
 * @method static Builder<static>|Discount whereApplyTo($value)
 * @method static Builder<static>|Discount whereApplyToDiscountedProducts($value)
 * @method static Builder<static>|Discount whereCode($value)
 * @method static Builder<static>|Discount whereCreatedAt($value)
 * @method static Builder<static>|Discount whereEndsAt($value)
 * @method static Builder<static>|Discount whereId($value)
 * @method static Builder<static>|Discount whereIsActive($value)
 * @method static Builder<static>|Discount whereIsAutoApply($value)
 * @method static Builder<static>|Discount whereIsStackable($value)
 * @method static Builder<static>|Discount whereMaxUses($value)
 * @method static Builder<static>|Discount whereMaxUsesPerCustomer($value)
 * @method static Builder<static>|Discount whereMinOrderValue($value)
 * @method static Builder<static>|Discount whereName($value)
 * @method static Builder<static>|Discount wherePriority($value)
 * @method static Builder<static>|Discount whereStartsAt($value)
 * @method static Builder<static>|Discount whereType($value)
 * @method static Builder<static>|Discount whereUpdatedAt($value)
 * @method static Builder<static>|Discount whereUsesCount($value)
 * @method static Builder<static>|Discount whereValue($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read int|null $categories_count
 * @property-read int|null $products_count
 */
	class Discount extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $discount_id
 * @property string $type
 * @property int $entity_id
 * @property-read Discount $discount
 * @method static Builder<static>|DiscountCondition newModelQuery()
 * @method static Builder<static>|DiscountCondition newQuery()
 * @method static Builder<static>|DiscountCondition query()
 * @method static Builder<static>|DiscountCondition whereDiscountId($value)
 * @method static Builder<static>|DiscountCondition whereEntityId($value)
 * @method static Builder<static>|DiscountCondition whereId($value)
 * @method static Builder<static>|DiscountCondition whereType($value)
 * @mixin Model
 */
	class DiscountCondition extends \Eloquent {}
}

namespace App\Models{
/**
 * @property string $subject
 * @property string $body
 * @property int $id
 * @property string $name
 * @property string $key
 * @property string|null $description
 * @property bool $is_active
 * @property array<array-key, mixed>|null $variables
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @method static EmailTemplateFactory factory($count = null, $state = [])
 * @method static Builder<static>|EmailTemplate newModelQuery()
 * @method static Builder<static>|EmailTemplate newQuery()
 * @method static Builder<static>|EmailTemplate query()
 * @method static Builder<static>|EmailTemplate whereBody($value)
 * @method static Builder<static>|EmailTemplate whereCreatedAt($value)
 * @method static Builder<static>|EmailTemplate whereDescription($value)
 * @method static Builder<static>|EmailTemplate whereId($value)
 * @method static Builder<static>|EmailTemplate whereIsActive($value)
 * @method static Builder<static>|EmailTemplate whereKey($value)
 * @method static Builder<static>|EmailTemplate whereName($value)
 * @method static Builder<static>|EmailTemplate whereSubject($value)
 * @method static Builder<static>|EmailTemplate whereUpdatedAt($value)
 * @method static Builder<static>|EmailTemplate whereVariables($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class EmailTemplate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $currency_id
 * @property float $rate
 * @property string $source
 * @property CarbonImmutable $fetched_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Currency $currency
 * @method static Builder<static>|ExchangeRate newModelQuery()
 * @method static Builder<static>|ExchangeRate newQuery()
 * @method static Builder<static>|ExchangeRate query()
 * @method static Builder<static>|ExchangeRate whereCreatedAt($value)
 * @method static Builder<static>|ExchangeRate whereCurrencyId($value)
 * @method static Builder<static>|ExchangeRate whereFetchedAt($value)
 * @method static Builder<static>|ExchangeRate whereId($value)
 * @method static Builder<static>|ExchangeRate whereRate($value)
 * @method static Builder<static>|ExchangeRate whereSource($value)
 * @method static Builder<static>|ExchangeRate whereUpdatedAt($value)
 * @mixin Model
 */
	class ExchangeRate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $question
 * @property string $answer
 * @property string|null $category
 * @property int $position
 * @property bool $is_active
 * @property int $views_count
 * @property int $helpful_count
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|Faq active()
 * @method static Builder<static>|Faq byCategory(?string $category)
 * @method static FaqFactory factory($count = null, $state = [])
 * @method static Builder<static>|Faq newModelQuery()
 * @method static Builder<static>|Faq newQuery()
 * @method static Builder<static>|Faq query()
 * @method static Builder<static>|Faq whereAnswer($value)
 * @method static Builder<static>|Faq whereCategory($value)
 * @method static Builder<static>|Faq whereCreatedAt($value)
 * @method static Builder<static>|Faq whereHelpfulCount($value)
 * @method static Builder<static>|Faq whereId($value)
 * @method static Builder<static>|Faq whereIsActive($value)
 * @method static Builder<static>|Faq wherePosition($value)
 * @method static Builder<static>|Faq whereQuestion($value)
 * @method static Builder<static>|Faq whereUpdatedAt($value)
 * @method static Builder<static>|Faq whereViewsCount($value)
 * @mixin Model
 */
	class Faq extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $product_id
 * @property int|null $variant_id
 * @property int $sale_price
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property bool $is_active
 * @property int|null $stock_limit
 * @property int $stock_sold
 * @property Product|null $product
 * @property ProductVariant|null $variant
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read string $status
 * @method static Builder<static>|FlashSale active()
 * @method static FlashSaleFactory factory($count = null, $state = [])
 * @method static Builder<static>|FlashSale newModelQuery()
 * @method static Builder<static>|FlashSale newQuery()
 * @method static Builder<static>|FlashSale query()
 * @method static Builder<static>|FlashSale whereCreatedAt($value)
 * @method static Builder<static>|FlashSale whereEndsAt($value)
 * @method static Builder<static>|FlashSale whereId($value)
 * @method static Builder<static>|FlashSale whereIsActive($value)
 * @method static Builder<static>|FlashSale whereName($value)
 * @method static Builder<static>|FlashSale whereProductId($value)
 * @method static Builder<static>|FlashSale whereSalePrice($value)
 * @method static Builder<static>|FlashSale whereStartsAt($value)
 * @method static Builder<static>|FlashSale whereStockLimit($value)
 * @method static Builder<static>|FlashSale whereStockSold($value)
 * @method static Builder<static>|FlashSale whereUpdatedAt($value)
 * @method static Builder<static>|FlashSale whereVariantId($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class FlashSale extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property array<array-key, mixed>|null $settings
 * @property array<array-key, mixed>|null $notify_emails
 * @property string|null $notification_email
 * @property string|null $success_message
 * @property bool $allow_multiple
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, FormField> $fields
 * @property-read int|null $fields_count
 * @property-read Collection<int, FormSubmission> $submissions
 * @property-read int|null $submissions_count
 * @method static Builder<static>|Form newModelQuery()
 * @method static Builder<static>|Form newQuery()
 * @method static Builder<static>|Form query()
 * @method static Builder<static>|Form whereAllowMultiple($value)
 * @method static Builder<static>|Form whereCreatedAt($value)
 * @method static Builder<static>|Form whereDescription($value)
 * @method static Builder<static>|Form whereId($value)
 * @method static Builder<static>|Form whereIsActive($value)
 * @method static Builder<static>|Form whereName($value)
 * @method static Builder<static>|Form whereNotificationEmail($value)
 * @method static Builder<static>|Form whereNotifyEmails($value)
 * @method static Builder<static>|Form whereSettings($value)
 * @method static Builder<static>|Form whereSlug($value)
 * @method static Builder<static>|Form whereSuccessMessage($value)
 * @method static Builder<static>|Form whereUpdatedAt($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Form extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $form_id
 * @property string $name
 * @property string $label
 * @property string $type
 * @property array<array-key, mixed>|null $options
 * @property array<array-key, mixed>|null $validation
 * @property array<array-key, mixed>|null $settings
 * @property int $position
 * @property bool $is_required
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Form $form
 * @method static Builder<static>|FormField newModelQuery()
 * @method static Builder<static>|FormField newQuery()
 * @method static Builder<static>|FormField query()
 * @method static Builder<static>|FormField whereCreatedAt($value)
 * @method static Builder<static>|FormField whereFormId($value)
 * @method static Builder<static>|FormField whereId($value)
 * @method static Builder<static>|FormField whereIsRequired($value)
 * @method static Builder<static>|FormField whereLabel($value)
 * @method static Builder<static>|FormField whereName($value)
 * @method static Builder<static>|FormField whereOptions($value)
 * @method static Builder<static>|FormField wherePosition($value)
 * @method static Builder<static>|FormField whereSettings($value)
 * @method static Builder<static>|FormField whereType($value)
 * @method static Builder<static>|FormField whereUpdatedAt($value)
 * @method static Builder<static>|FormField whereValidation($value)
 * @mixin Model
 */
	class FormField extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $form_id
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property string|null $ip
 * @property string|null $user_agent
 * @property string|null $referrer
 * @property string|null $page_url
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Form $form
 * @method static Builder<static>|FormSubmission newModelQuery()
 * @method static Builder<static>|FormSubmission newQuery()
 * @method static Builder<static>|FormSubmission query()
 * @method static Builder<static>|FormSubmission whereCreatedAt($value)
 * @method static Builder<static>|FormSubmission whereFormId($value)
 * @method static Builder<static>|FormSubmission whereId($value)
 * @method static Builder<static>|FormSubmission whereIp($value)
 * @method static Builder<static>|FormSubmission wherePageUrl($value)
 * @method static Builder<static>|FormSubmission wherePayload($value)
 * @method static Builder<static>|FormSubmission whereReferrer($value)
 * @method static Builder<static>|FormSubmission whereStatus($value)
 * @method static Builder<static>|FormSubmission whereUpdatedAt($value)
 * @method static Builder<static>|FormSubmission whereUserAgent($value)
 * @mixin Model
 */
	class FormSubmission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property SlotLocationEnum $location
 * @property int|null $reusable_block_id
 * @property string $label
 * @property array<string, mixed>|null $configuration
 * @property bool $is_active
 * @property int $position
 * @property array<string, mixed>|null $settings
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ReusableBlock|null $reusableBlock
 * @method static Builder<static>|GlobalSlot active()
 * @method static Builder<static>|GlobalSlot forLocation(SlotLocationEnum|string $location)
 * @method static Builder<static>|GlobalSlot newModelQuery()
 * @method static Builder<static>|GlobalSlot newQuery()
 * @method static Builder<static>|GlobalSlot query()
 * @mixin Model
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereConfiguration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereReusableBlockId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GlobalSlot whereUpdatedAt($value)
 */
	class GlobalSlot extends \Eloquent {}
}

namespace App\Models{
/**
 * @property HomepageSectionTypeEnum $type
 * @method static Builder<static>|HomepageSection newModelQuery()
 * @method static Builder<static>|HomepageSection newQuery()
 * @method static Builder<static>|HomepageSection query()
 * @mixin Model
 */
	class HomepageSection extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_variant_id
 * @property int|null $cart_id
 * @property int $quantity
 * @property \Carbon\CarbonImmutable $expires_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Cart|null $cart
 * @property-read \App\Models\ProductVariant $variant
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereCartId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereProductVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryReservation whereUpdatedAt($value)
 */
	class InventoryReservation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $native_name
 * @property string|null $flag_emoji
 * @property string|null $currency_code
 * @property bool $is_default
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Translation> $translations
 * @property-read int|null $translations_count
 * @method static Builder<static>|Locale active()
 * @method static Builder<static>|Locale default()
 * @method static Builder<static>|Locale newModelQuery()
 * @method static Builder<static>|Locale newQuery()
 * @method static Builder<static>|Locale query()
 * @method static Builder<static>|Locale whereCode($value)
 * @method static Builder<static>|Locale whereCreatedAt($value)
 * @method static Builder<static>|Locale whereCurrencyCode($value)
 * @method static Builder<static>|Locale whereFlagEmoji($value)
 * @method static Builder<static>|Locale whereId($value)
 * @method static Builder<static>|Locale whereIsActive($value)
 * @method static Builder<static>|Locale whereIsDefault($value)
 * @method static Builder<static>|Locale whereName($value)
 * @method static Builder<static>|Locale whereNativeName($value)
 * @method static Builder<static>|Locale whereUpdatedAt($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Locale extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $balance
 * @property int $total_earned
 * @property int $total_spent
 * @property int $id
 * @property int $customer_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Collection<int, LoyaltyTransaction> $transactions
 * @property-read int|null $transactions_count
 * @method static Builder<static>|LoyaltyPoint newModelQuery()
 * @method static Builder<static>|LoyaltyPoint newQuery()
 * @method static Builder<static>|LoyaltyPoint query()
 * @method static Builder<static>|LoyaltyPoint whereBalance($value)
 * @method static Builder<static>|LoyaltyPoint whereCreatedAt($value)
 * @method static Builder<static>|LoyaltyPoint whereCustomerId($value)
 * @method static Builder<static>|LoyaltyPoint whereId($value)
 * @method static Builder<static>|LoyaltyPoint whereTotalEarned($value)
 * @method static Builder<static>|LoyaltyPoint whereTotalSpent($value)
 * @method static Builder<static>|LoyaltyPoint whereUpdatedAt($value)
 * @mixin Model
 */
	class LoyaltyPoint extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property string $type
 * @property int $points
 * @property string $description
 * @property string $source_type
 * @property int $source_id
 * @property int $balance_after
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Model $source
 * @method static Builder<static>|LoyaltyTransaction newModelQuery()
 * @method static Builder<static>|LoyaltyTransaction newQuery()
 * @method static Builder<static>|LoyaltyTransaction query()
 * @method static Builder<static>|LoyaltyTransaction whereBalanceAfter($value)
 * @method static Builder<static>|LoyaltyTransaction whereCreatedAt($value)
 * @method static Builder<static>|LoyaltyTransaction whereCustomerId($value)
 * @method static Builder<static>|LoyaltyTransaction whereDescription($value)
 * @method static Builder<static>|LoyaltyTransaction whereId($value)
 * @method static Builder<static>|LoyaltyTransaction wherePoints($value)
 * @method static Builder<static>|LoyaltyTransaction whereSourceId($value)
 * @method static Builder<static>|LoyaltyTransaction whereSourceType($value)
 * @method static Builder<static>|LoyaltyTransaction whereType($value)
 * @method static Builder<static>|LoyaltyTransaction whereUpdatedAt($value)
 * @mixin Model
 */
	class LoyaltyTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property MenuLocationEnum|null $location
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, MenuItem> $allItems
 * @property-read int|null $all_items_count
 * @property-read Collection<int, MenuItem> $items
 * @property-read int|null $items_count
 * @method static Builder<static>|Menu newModelQuery()
 * @method static Builder<static>|Menu newQuery()
 * @method static Builder<static>|Menu query()
 * @method static Builder<static>|Menu whereCreatedAt($value)
 * @method static Builder<static>|Menu whereId($value)
 * @method static Builder<static>|Menu whereIsActive($value)
 * @method static Builder<static>|Menu whereLocation($value)
 * @method static Builder<static>|Menu whereName($value)
 * @method static Builder<static>|Menu whereUpdatedAt($value)
 * @mixin Model
 */
	class Menu extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $menu_id
 * @property int|null $parent_id
 * @property array<array-key, mixed>|null $label
 * @property string|null $url
 * @property string $target
 * @property MenuLinkTypeEnum $link_type
 * @property int|null $linked_entity_id
 * @property string|null $icon
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, MenuItem> $children
 * @property-read int|null $children_count
 * @property-read Menu $menu
 * @property-read MenuItem|null $parent
 * @method static Builder<static>|MenuItem newModelQuery()
 * @method static Builder<static>|MenuItem newQuery()
 * @method static Builder<static>|MenuItem query()
 * @method static Builder<static>|MenuItem whereCreatedAt($value)
 * @method static Builder<static>|MenuItem whereIcon($value)
 * @method static Builder<static>|MenuItem whereId($value)
 * @method static Builder<static>|MenuItem whereIsActive($value)
 * @method static Builder<static>|MenuItem whereLabel($value)
 * @method static Builder<static>|MenuItem whereLinkType($value)
 * @method static Builder<static>|MenuItem whereLinkedEntityId($value)
 * @method static Builder<static>|MenuItem whereMenuId($value)
 * @method static Builder<static>|MenuItem whereParentId($value)
 * @method static Builder<static>|MenuItem wherePosition($value)
 * @method static Builder<static>|MenuItem whereTarget($value)
 * @method static Builder<static>|MenuItem whereUpdatedAt($value)
 * @method static Builder<static>|MenuItem whereUrl($value)
 * @mixin Model
 */
	class MenuItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $owner_type
 * @property int $owner_id
 * @property string $namespace
 * @property string $key
 * @property string $type
 * @property string|null $value
 * @property string|null $description
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Model $owner
 * @method static Builder<static>|Metafield newModelQuery()
 * @method static Builder<static>|Metafield newQuery()
 * @method static Builder<static>|Metafield query()
 * @method static Builder<static>|Metafield whereCreatedAt($value)
 * @method static Builder<static>|Metafield whereDescription($value)
 * @method static Builder<static>|Metafield whereId($value)
 * @method static Builder<static>|Metafield whereKey($value)
 * @method static Builder<static>|Metafield whereNamespace($value)
 * @method static Builder<static>|Metafield whereOwnerId($value)
 * @method static Builder<static>|Metafield whereOwnerType($value)
 * @method static Builder<static>|Metafield whereType($value)
 * @method static Builder<static>|Metafield whereUpdatedAt($value)
 * @method static Builder<static>|Metafield whereValue($value)
 * @mixin Model
 */
	class Metafield extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $owner_type
 * @property string $namespace
 * @property string $key
 * @property string $name
 * @property string $type
 * @property string|null $description
 * @property array<array-key, mixed>|null $validations
 * @property bool $pinned
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|MetafieldDefinition forOwnerType(string $type)
 * @method static Builder<static>|MetafieldDefinition newModelQuery()
 * @method static Builder<static>|MetafieldDefinition newQuery()
 * @method static Builder<static>|MetafieldDefinition pinned()
 * @method static Builder<static>|MetafieldDefinition query()
 * @method static Builder<static>|MetafieldDefinition whereCreatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereDescription($value)
 * @method static Builder<static>|MetafieldDefinition whereId($value)
 * @method static Builder<static>|MetafieldDefinition whereKey($value)
 * @method static Builder<static>|MetafieldDefinition whereName($value)
 * @method static Builder<static>|MetafieldDefinition whereNamespace($value)
 * @method static Builder<static>|MetafieldDefinition whereOwnerType($value)
 * @method static Builder<static>|MetafieldDefinition wherePinned($value)
 * @method static Builder<static>|MetafieldDefinition wherePosition($value)
 * @method static Builder<static>|MetafieldDefinition whereType($value)
 * @method static Builder<static>|MetafieldDefinition whereUpdatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereValidations($value)
 * @mixin Model
 */
	class MetafieldDefinition extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $versionable_type
 * @property int $versionable_id
 * @property int $version_number
 * @property array<array-key, mixed> $snapshot
 * @property array<array-key, mixed>|null $changes
 * @property string $event
 * @property int|null $created_by
 * @property string|null $change_note
 * @property CarbonImmutable $created_at
 * @property-read User|null $creator
 * @property-read Model $versionable
 * @method static Builder<static>|ModelVersion newModelQuery()
 * @method static Builder<static>|ModelVersion newQuery()
 * @method static Builder<static>|ModelVersion query()
 * @method static Builder<static>|ModelVersion whereChangeNote($value)
 * @method static Builder<static>|ModelVersion whereChanges($value)
 * @method static Builder<static>|ModelVersion whereCreatedAt($value)
 * @method static Builder<static>|ModelVersion whereCreatedBy($value)
 * @method static Builder<static>|ModelVersion whereEvent($value)
 * @method static Builder<static>|ModelVersion whereId($value)
 * @method static Builder<static>|ModelVersion whereSnapshot($value)
 * @method static Builder<static>|ModelVersion whereVersionNumber($value)
 * @method static Builder<static>|ModelVersion whereVersionableId($value)
 * @method static Builder<static>|ModelVersion whereVersionableType($value)
 * @mixin Model
 */
	class ModelVersion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $page_module_id
 * @property string $key
 * @property string $name
 * @property string $type
 * @property string $component_name
 * @property string|null $preview_image
 * @property array|null $configuration_schema
 * @property array|null $default_configuration
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read PageModule $module
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 * @method static Builder<static>|ModuleLayout newModelQuery()
 * @method static Builder<static>|ModuleLayout newQuery()
 * @method static Builder<static>|ModuleLayout query()
 * @method static Builder<static>|ModuleLayout whereComponentName($value)
 * @method static Builder<static>|ModuleLayout whereConfigurationSchema($value)
 * @method static Builder<static>|ModuleLayout whereCreatedAt($value)
 * @method static Builder<static>|ModuleLayout whereDefaultConfiguration($value)
 * @method static Builder<static>|ModuleLayout whereId($value)
 * @method static Builder<static>|ModuleLayout whereIsActive($value)
 * @method static Builder<static>|ModuleLayout whereKey($value)
 * @method static Builder<static>|ModuleLayout whereName($value)
 * @method static Builder<static>|ModuleLayout wherePageModuleId($value)
 * @method static Builder<static>|ModuleLayout wherePreviewImage($value)
 * @method static Builder<static>|ModuleLayout whereType($value)
 * @method static Builder<static>|ModuleLayout whereUpdatedAt($value)
 * @mixin Model
 */
	class ModuleLayout extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $subject
 * @property string|null $preview_text
 * @property string $sender_email
 * @property string $sender_name
 * @property string $html_content
 * @property string|null $plain_text_content
 * @property string $audience_type
 * @property string $type
 * @property CampaignStatusEnum $status
 * @property CampaignTriggerEnum|null $trigger
 * @property int|null $trigger_delay_hours
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $created_at
 * @property int $total_sent
 * @property int $sends_count
 * @property int|null $newsletter_segment_id
 * @property array<array-key, mixed>|null $target_tags
 * @property CarbonImmutable|null $started_sending_at
 * @property CarbonImmutable|null $finished_sending_at
 * @property int $total_recipients
 * @property int $total_delivered
 * @property int $total_opened
 * @property int $total_clicked
 * @property int $total_bounced
 * @property int $total_unsubscribed
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterClick> $clicks
 * @property-read int|null $clicks_count
 * @property-read Collection<int, NewsletterOpen> $opens
 * @property-read int|null $opens_count
 * @property-read NewsletterSegment|null $segment
 * @property-read Collection<int, NewsletterSend> $sends
 * @method static NewsletterCampaignFactory factory($count = null, $state = [])
 * @method static Builder<static>|NewsletterCampaign newModelQuery()
 * @method static Builder<static>|NewsletterCampaign newQuery()
 * @method static Builder<static>|NewsletterCampaign query()
 * @method static Builder<static>|NewsletterCampaign whereAudienceType($value)
 * @method static Builder<static>|NewsletterCampaign whereCreatedAt($value)
 * @method static Builder<static>|NewsletterCampaign whereFinishedSendingAt($value)
 * @method static Builder<static>|NewsletterCampaign whereHtmlContent($value)
 * @method static Builder<static>|NewsletterCampaign whereId($value)
 * @method static Builder<static>|NewsletterCampaign whereName($value)
 * @method static Builder<static>|NewsletterCampaign whereNewsletterSegmentId($value)
 * @method static Builder<static>|NewsletterCampaign wherePlainTextContent($value)
 * @method static Builder<static>|NewsletterCampaign wherePreviewText($value)
 * @method static Builder<static>|NewsletterCampaign whereScheduledAt($value)
 * @method static Builder<static>|NewsletterCampaign whereSenderEmail($value)
 * @method static Builder<static>|NewsletterCampaign whereSenderName($value)
 * @method static Builder<static>|NewsletterCampaign whereStartedSendingAt($value)
 * @method static Builder<static>|NewsletterCampaign whereStatus($value)
 * @method static Builder<static>|NewsletterCampaign whereSubject($value)
 * @method static Builder<static>|NewsletterCampaign whereTargetTags($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalBounced($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalClicked($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalDelivered($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalOpened($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalRecipients($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalSent($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalUnsubscribed($value)
 * @method static Builder<static>|NewsletterCampaign whereTrigger($value)
 * @method static Builder<static>|NewsletterCampaign whereTriggerDelayHours($value)
 * @method static Builder<static>|NewsletterCampaign whereType($value)
 * @method static Builder<static>|NewsletterCampaign whereUpdatedAt($value)
 * @mixin Model
 */
	class NewsletterCampaign extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $newsletter_campaign_id
 * @property int $newsletter_subscriber_id
 * @property string $url
 * @property string $tracking_token
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable $clicked_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 * @method static Builder<static>|NewsletterClick newModelQuery()
 * @method static Builder<static>|NewsletterClick newQuery()
 * @method static Builder<static>|NewsletterClick query()
 * @method static Builder<static>|NewsletterClick whereClickedAt($value)
 * @method static Builder<static>|NewsletterClick whereId($value)
 * @method static Builder<static>|NewsletterClick whereIpAddress($value)
 * @method static Builder<static>|NewsletterClick whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterClick whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterClick whereTrackingToken($value)
 * @method static Builder<static>|NewsletterClick whereUrl($value)
 * @method static Builder<static>|NewsletterClick whereUserAgent($value)
 * @mixin Model
 */
	class NewsletterClick extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $newsletter_campaign_id
 * @property int $newsletter_subscriber_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable $opened_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 * @method static Builder<static>|NewsletterOpen newModelQuery()
 * @method static Builder<static>|NewsletterOpen newQuery()
 * @method static Builder<static>|NewsletterOpen query()
 * @method static Builder<static>|NewsletterOpen whereId($value)
 * @method static Builder<static>|NewsletterOpen whereIpAddress($value)
 * @method static Builder<static>|NewsletterOpen whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterOpen whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterOpen whereOpenedAt($value)
 * @method static Builder<static>|NewsletterOpen whereUserAgent($value)
 * @mixin Model
 */
	class NewsletterOpen extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $rules
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterCampaign> $campaigns
 * @property-read int|null $campaigns_count
 * @method static Builder<static>|NewsletterSegment newModelQuery()
 * @method static Builder<static>|NewsletterSegment newQuery()
 * @method static Builder<static>|NewsletterSegment query()
 * @method static Builder<static>|NewsletterSegment whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSegment whereDescription($value)
 * @method static Builder<static>|NewsletterSegment whereId($value)
 * @method static Builder<static>|NewsletterSegment whereIsActive($value)
 * @method static Builder<static>|NewsletterSegment whereName($value)
 * @method static Builder<static>|NewsletterSegment whereRules($value)
 * @method static Builder<static>|NewsletterSegment whereUpdatedAt($value)
 * @mixin Model
 */
	class NewsletterSegment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $newsletter_campaign_id
 * @property int $newsletter_subscriber_id
 * @property string $status
 * @property string|null $message_id
 * @property string|null $error_message
 * @property CarbonImmutable|null $sent_at
 * @property CarbonImmutable|null $delivered_at
 * @property CarbonImmutable|null $failed_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 * @method static Builder<static>|NewsletterSend newModelQuery()
 * @method static Builder<static>|NewsletterSend newQuery()
 * @method static Builder<static>|NewsletterSend query()
 * @method static Builder<static>|NewsletterSend whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSend whereDeliveredAt($value)
 * @method static Builder<static>|NewsletterSend whereErrorMessage($value)
 * @method static Builder<static>|NewsletterSend whereFailedAt($value)
 * @method static Builder<static>|NewsletterSend whereId($value)
 * @method static Builder<static>|NewsletterSend whereMessageId($value)
 * @method static Builder<static>|NewsletterSend whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterSend whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterSend whereSentAt($value)
 * @method static Builder<static>|NewsletterSend whereStatus($value)
 * @method static Builder<static>|NewsletterSend whereUpdatedAt($value)
 * @mixin Model
 */
	class NewsletterSend extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $customer_id
 * @property string $email
 * @property string|null $first_name
 * @property string $locale
 * @property string $token
 * @property array<array-key, mixed>|null $tags
 * @property bool $consent_given
 * @property CarbonImmutable|null $consent_given_at
 * @property string|null $consent_ip
 * @property string|null $consent_source
 * @property bool $is_active
 * @property CarbonImmutable|null $unsubscribed_at
 * @property string|null $unsubscribe_reason
 * @property bool $is_bounced
 * @property CarbonImmutable|null $bounced_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterClick> $clicks
 * @property-read int|null $clicks_count
 * @property-read Collection<int, NewsletterOpen> $opens
 * @property-read int|null $opens_count
 * @property-read Collection<int, NewsletterSend> $sends
 * @property-read int|null $sends_count
 * @method static Builder<static>|NewsletterSubscriber newModelQuery()
 * @method static Builder<static>|NewsletterSubscriber newQuery()
 * @method static Builder<static>|NewsletterSubscriber query()
 * @method static Builder<static>|NewsletterSubscriber whereBouncedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentGiven($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentGivenAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentIp($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentSource($value)
 * @method static Builder<static>|NewsletterSubscriber whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereCustomerId($value)
 * @method static Builder<static>|NewsletterSubscriber whereEmail($value)
 * @method static Builder<static>|NewsletterSubscriber whereFirstName($value)
 * @method static Builder<static>|NewsletterSubscriber whereId($value)
 * @method static Builder<static>|NewsletterSubscriber whereIsActive($value)
 * @method static Builder<static>|NewsletterSubscriber whereIsBounced($value)
 * @method static Builder<static>|NewsletterSubscriber whereLocale($value)
 * @method static Builder<static>|NewsletterSubscriber whereTags($value)
 * @method static Builder<static>|NewsletterSubscriber whereToken($value)
 * @method static Builder<static>|NewsletterSubscriber whereUnsubscribeReason($value)
 * @method static Builder<static>|NewsletterSubscriber whereUnsubscribedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereUpdatedAt($value)
 * @mixin Model
 * @property-read \App\Models\Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NewsletterSegment> $segments
 * @property-read int|null $segments_count
 */
	class NewsletterSubscriber extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $channel
 * @property string $event
 * @property bool $is_enabled
 * @property int|null $user_id
 * @property int|null $customer_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read User|null $user
 * @method static Builder<static>|NotificationPreference newModelQuery()
 * @method static Builder<static>|NotificationPreference newQuery()
 * @method static Builder<static>|NotificationPreference query()
 * @method static Builder<static>|NotificationPreference whereChannel($value)
 * @method static Builder<static>|NotificationPreference whereCreatedAt($value)
 * @method static Builder<static>|NotificationPreference whereCustomerId($value)
 * @method static Builder<static>|NotificationPreference whereEvent($value)
 * @method static Builder<static>|NotificationPreference whereId($value)
 * @method static Builder<static>|NotificationPreference whereIsEnabled($value)
 * @method static Builder<static>|NotificationPreference whereUpdatedAt($value)
 * @method static Builder<static>|NotificationPreference whereUserId($value)
 * @mixin Model
 */
	class NotificationPreference extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reference_number
 * @property string|null $invoice_number
 * @property Carbon|null $invoice_issued_at
 * @property string|null $buyer_vat_id
 * @property string|null $buyer_company_name
 * @property OrderState $status
 * @property int $subtotal
 * @property int $shipping_cost
 * @property int $discount_amount
 * @property int $tax_amount
 * @property int $total
 * @property string $currency_code
 * @property string|null $notes
 * @property string|null $guest_email
 * @property string|null $terms_consent_version
 * @property string|null $privacy_consent_version
 * @property array<string, mixed>|null $legal_version_snapshot
 * @property Carbon|null $terms_accepted_at
 * @property Carbon $created_at
 * @property Collection<int, OrderItem> $items
 * @property Customer|null $customer
 * @property Shipment|null $shipment
 * @property Payment|null $payment
 * @property Collection $returns
 * @property int|null $customer_id
 * @property int $billing_address_id
 * @property int $shipping_address_id
 * @property numeric $exchange_rate
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Address $billingAddress
 * @property-read int|null $items_count
 * @property-read int|null $returns_count
 * @property-read Collection<int, Shipment> $shipments
 * @property-read int|null $shipments_count
 * @property-read Address $shippingAddress
 * @property-read Collection<int, OrderStatusHistory> $statusHistory
 * @property-read int|null $status_history_count
 * @method static OrderFactory factory($count = null, $state = [])
 * @method static Builder<static>|Order newModelQuery()
 * @method static Builder<static>|Order newQuery()
 * @method static Builder<static>|Order orWhereNotState(string $column, $states)
 * @method static Builder<static>|Order orWhereState(string $column, $states)
 * @method static Builder<static>|Order query()
 * @method static Builder<static>|Order whereBillingAddressId($value)
 * @method static Builder<static>|Order whereBuyerCompanyName($value)
 * @method static Builder<static>|Order whereBuyerVatId($value)
 * @method static Builder<static>|Order whereCreatedAt($value)
 * @method static Builder<static>|Order whereCurrencyCode($value)
 * @method static Builder<static>|Order whereCustomerId($value)
 * @method static Builder<static>|Order whereDiscountAmount($value)
 * @method static Builder<static>|Order whereExchangeRate($value)
 * @method static Builder<static>|Order whereGuestEmail($value)
 * @method static Builder<static>|Order whereId($value)
 * @method static Builder<static>|Order whereInvoiceIssuedAt($value)
 * @method static Builder<static>|Order whereInvoiceNumber($value)
 * @method static Builder<static>|Order whereNotState(string $column, $states)
 * @method static Builder<static>|Order whereNotes($value)
 * @method static Builder<static>|Order whereReferenceNumber($value)
 * @method static Builder<static>|Order whereShippingAddressId($value)
 * @method static Builder<static>|Order whereShippingCost($value)
 * @method static Builder<static>|Order whereState(string $column, $states)
 * @method static Builder<static>|Order whereStatus($value)
 * @method static Builder<static>|Order whereSubtotal($value)
 * @method static Builder<static>|Order whereTaxAmount($value)
 * @method static Builder<static>|Order whereTotal($value)
 * @method static Builder<static>|Order whereUpdatedAt($value)
 * @mixin Model
 * @property string $customer_type
 * @property bool $is_tax_exempt
 * @property bool $wants_invoice
 * @property int $items_tax_amount
 * @property int $shipping_tax_amount
 * @property string|null $ga_client_id GA4 client_id from _ga cookie
 * @property string|null $baselinker_order_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereBaselinkerOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCustomerType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereGaClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereIsTaxExempt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereItemsTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereLegalVersionSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePrivacyConsentVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereTermsAcceptedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereTermsConsentVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereWantsInvoice($value)
 */
	class Order extends \Eloquent {}
}

namespace App\Models{
/**
 * Order Item Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property int $order_id
 * @property int|null $variant_id
 * @property string $product_name
 * @property string|null $variant_name
 * @property string $sku
 * @property int $quantity
 * @property int $unit_price
 * @property int $total_price
 * @property int $shipped_quantity
 * @property int|null $product_id
 * @property-read ProductVariant|null $variant
 * @property-read int $remaining_to_ship
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Order $order
 * @property-read Collection<int, ShipmentItem> $shipmentItems
 * @property-read int|null $shipment_items_count
 * @method static OrderItemFactory factory($count = null, $state = [])
 * @method static Builder<static>|OrderItem newModelQuery()
 * @method static Builder<static>|OrderItem newQuery()
 * @method static Builder<static>|OrderItem query()
 * @method static Builder<static>|OrderItem whereCreatedAt($value)
 * @method static Builder<static>|OrderItem whereId($value)
 * @method static Builder<static>|OrderItem whereOrderId($value)
 * @method static Builder<static>|OrderItem whereProductName($value)
 * @method static Builder<static>|OrderItem whereQuantity($value)
 * @method static Builder<static>|OrderItem whereShippedQuantity($value)
 * @method static Builder<static>|OrderItem whereSku($value)
 * @method static Builder<static>|OrderItem whereTotalPrice($value)
 * @method static Builder<static>|OrderItem whereUnitPrice($value)
 * @method static Builder<static>|OrderItem whereUpdatedAt($value)
 * @method static Builder<static>|OrderItem whereVariantId($value)
 * @method static Builder<static>|OrderItem whereVariantName($value)
 * @mixin Model
 */
	class OrderItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string $previous_status
 * @property string $new_status
 * @property string $changed_by
 * @property int|null $changed_by_user_id
 * @property string|null $notes
 * @property CarbonImmutable $changed_at
 * @property-read Order $order
 * @method static Builder<static>|OrderStatusHistory newModelQuery()
 * @method static Builder<static>|OrderStatusHistory newQuery()
 * @method static Builder<static>|OrderStatusHistory query()
 * @method static Builder<static>|OrderStatusHistory whereChangedAt($value)
 * @method static Builder<static>|OrderStatusHistory whereChangedBy($value)
 * @method static Builder<static>|OrderStatusHistory whereChangedByUserId($value)
 * @method static Builder<static>|OrderStatusHistory whereId($value)
 * @method static Builder<static>|OrderStatusHistory whereNewStatus($value)
 * @method static Builder<static>|OrderStatusHistory whereNotes($value)
 * @method static Builder<static>|OrderStatusHistory whereOrderId($value)
 * @method static Builder<static>|OrderStatusHistory wherePreviousStatus($value)
 * @mixin Model
 */
	class OrderStatusHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $version
 * @property int|null $parent_id
 * @property string $title
 * @property string $slug
 * @property string|null $content
 * @property string|null $rich_content
 * @property string|null $excerpt
 * @property PageLayoutEnum $layout
 * @property array<string, mixed>|null $builder_snapshot
 * @property PageTypeEnum $page_type
 * @property string|null $module_name
 * @property string|null $system_page_key
 * @property array<string, mixed>|null $module_config
 * @property int|null $theme_id
 * @property bool $is_published
 * @property int|null $published_version_id
 * @property int|null $draft_version_id
 * @property CarbonInterface|null $published_at
 * @property CarbonInterface|null $scheduled_publish_at
 * @property CarbonInterface|null $scheduled_unpublish_at
 * @property string|null $approval_status
 * @property int|null $reviewer_id
 * @property string|null $review_note
 * @property CarbonInterface|null $submitted_for_review_at
 * @property CarbonInterface|null $approved_at
 * @property int $position
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $seo_canonical
 * @property array<int, string>|null $available_locales
 * @property-read Page|null $parent
 * @property-read Collection<int, Page> $children
 * @property-read Collection<int, PageBlock> $blocks
 * @property-read Collection<int, PageBlock> $allBlocks
 * @property-read Collection<int, PageSection> $sections
 * @property-read Collection<int, PageSection> $allSections
 * @property-read Collection<int, PageBlock> $sectionBlocks
 * @property-read Collection<int, PageVersion> $versions
 * @property-read PageVersion|null $publishedVersion
 * @property-read PageVersion|null $draftVersion
 * @property-read Theme|null $theme
 * @property string|null $locale null = global (fallback for all locales), or locale code e.g. pl, en
 * @property int|null $page_module_id
 * @property string|null $module_type
 * @property int|null $module_layout_id
 * @property string|null $module_configuration
 * @property int $is_draft
 * @property int $is_auto_generated
 * @property string|null $auto_gen_pattern
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $all_blocks_count
 * @property-read int|null $all_sections_count
 * @property-read int|null $blocks_count
 * @property-read int|null $children_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read int|null $section_blocks_count
 * @property-read int|null $sections_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read int|null $versions_count
 * @method static PageFactory factory($count = null, $state = [])
 * @method static Builder<static>|Page forLocale(?string $locale)
 * @method static Builder<static>|Page newModelQuery()
 * @method static Builder<static>|Page newQuery()
 * @method static Builder<static>|Page query()
 * @method static Builder<static>|Page whereApprovalStatus($value)
 * @method static Builder<static>|Page whereApprovedAt($value)
 * @method static Builder<static>|Page whereAutoGenPattern($value)
 * @method static Builder<static>|Page whereAvailableLocales($value)
 * @method static Builder<static>|Page whereBuilderSnapshot($value)
 * @method static Builder<static>|Page whereContent($value)
 * @method static Builder<static>|Page whereCreatedAt($value)
 * @method static Builder<static>|Page whereDraftVersionId($value)
 * @method static Builder<static>|Page whereExcerpt($value)
 * @method static Builder<static>|Page whereId($value)
 * @method static Builder<static>|Page whereIsAutoGenerated($value)
 * @method static Builder<static>|Page whereIsDraft($value)
 * @method static Builder<static>|Page whereIsPublished($value)
 * @method static Builder<static>|Page whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Page whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Page whereLayout($value)
 * @method static Builder<static>|Page whereLocale($value)
 * @method static Builder<static>|Page whereLocales(string $column, array $locales)
 * @method static Builder<static>|Page whereMetaRobots($value)
 * @method static Builder<static>|Page whereModuleConfig($value)
 * @method static Builder<static>|Page whereModuleConfiguration($value)
 * @method static Builder<static>|Page whereModuleLayoutId($value)
 * @method static Builder<static>|Page whereModuleName($value)
 * @method static Builder<static>|Page whereModuleType($value)
 * @method static Builder<static>|Page whereOgImage($value)
 * @method static Builder<static>|Page wherePageModuleId($value)
 * @method static Builder<static>|Page wherePageType($value)
 * @method static Builder<static>|Page whereParentId($value)
 * @method static Builder<static>|Page wherePosition($value)
 * @method static Builder<static>|Page wherePublishedAt($value)
 * @method static Builder<static>|Page wherePublishedVersionId($value)
 * @method static Builder<static>|Page whereReviewNote($value)
 * @method static Builder<static>|Page whereReviewerId($value)
 * @method static Builder<static>|Page whereRichContent($value)
 * @method static Builder<static>|Page whereScheduledPublishAt($value)
 * @method static Builder<static>|Page whereScheduledUnpublishAt($value)
 * @method static Builder<static>|Page whereSeoCanonical($value)
 * @method static Builder<static>|Page whereSeoDescription($value)
 * @method static Builder<static>|Page whereSeoTitle($value)
 * @method static Builder<static>|Page whereSitemapExclude($value)
 * @method static Builder<static>|Page whereSlug($value)
 * @method static Builder<static>|Page whereSubmittedForReviewAt($value)
 * @method static Builder<static>|Page whereSystemPageKey($value)
 * @method static Builder<static>|Page whereThemeId($value)
 * @method static Builder<static>|Page whereTitle($value)
 * @method static Builder<static>|Page whereUpdatedAt($value)
 * @method static Builder<static>|Page whereVersion($value)
 * @method static Builder<static>|Page withFullContent()
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Page extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $page_id
 * @property int $section_id
 * @property PageBlockTypeEnum $type
 * @property array<string, mixed>|null $configuration
 * @property int $position
 * @property bool $is_active
 * @property-read Page $page
 * @property-read PageSection|null $section
 * @property-read Collection<BlockRelation> $relations
 * @property int|null $reusable_block_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $relations_count
 * @property-read ReusableBlock|null $reusableBlock
 * @method static Builder<static>|PageBlock newModelQuery()
 * @method static Builder<static>|PageBlock newQuery()
 * @method static Builder<static>|PageBlock query()
 * @method static Builder<static>|PageBlock whereConfiguration($value)
 * @method static Builder<static>|PageBlock whereCreatedAt($value)
 * @method static Builder<static>|PageBlock whereId($value)
 * @method static Builder<static>|PageBlock whereIsActive($value)
 * @method static Builder<static>|PageBlock wherePageId($value)
 * @method static Builder<static>|PageBlock wherePosition($value)
 * @method static Builder<static>|PageBlock whereReusableBlockId($value)
 * @method static Builder<static>|PageBlock whereSectionId($value)
 * @method static Builder<static>|PageBlock whereType($value)
 * @method static Builder<static>|PageBlock whereUpdatedAt($value)
 * @mixin Model
 */
	class PageBlock extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $key
 * @property string $name
 * @property string|null $icon
 * @property string|null $description
 * @property bool $has_list_page
 * @property bool $has_detail_page
 * @property string|null $list_route_pattern
 * @property string|null $detail_route_pattern
 * @property string|null $model_class
 * @property string $route_key_name
 * @property bool $is_active
 * @property bool $is_system
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ModuleLayout> $activeLayouts
 * @property-read int|null $active_layouts_count
 * @property-read Collection<int, ModuleLayout> $detailLayouts
 * @property-read int|null $detail_layouts_count
 * @property-read Collection<int, ModuleLayout> $layouts
 * @property-read int|null $layouts_count
 * @property-read Collection<int, ModuleLayout> $listLayouts
 * @property-read int|null $list_layouts_count
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 * @method static Builder<static>|PageModule newModelQuery()
 * @method static Builder<static>|PageModule newQuery()
 * @method static Builder<static>|PageModule query()
 * @method static Builder<static>|PageModule whereCreatedAt($value)
 * @method static Builder<static>|PageModule whereDescription($value)
 * @method static Builder<static>|PageModule whereDetailRoutePattern($value)
 * @method static Builder<static>|PageModule whereHasDetailPage($value)
 * @method static Builder<static>|PageModule whereHasListPage($value)
 * @method static Builder<static>|PageModule whereIcon($value)
 * @method static Builder<static>|PageModule whereId($value)
 * @method static Builder<static>|PageModule whereIsActive($value)
 * @method static Builder<static>|PageModule whereIsSystem($value)
 * @method static Builder<static>|PageModule whereKey($value)
 * @method static Builder<static>|PageModule whereListRoutePattern($value)
 * @method static Builder<static>|PageModule whereModelClass($value)
 * @method static Builder<static>|PageModule whereName($value)
 * @method static Builder<static>|PageModule whereRouteKeyName($value)
 * @method static Builder<static>|PageModule whereUpdatedAt($value)
 * @mixin Model
 */
	class PageModule extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $page_id
 * @property int|null $page_version_id
 * @property string $token_hash
 * @property Carbon $expires_at
 * @property int|null $created_by
 * @property int $id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 * @property-read Page $page
 * @property-read PageVersion|null $version
 * @method static Builder<static>|PagePreviewToken newModelQuery()
 * @method static Builder<static>|PagePreviewToken newQuery()
 * @method static Builder<static>|PagePreviewToken query()
 * @method static Builder<static>|PagePreviewToken whereCreatedAt($value)
 * @method static Builder<static>|PagePreviewToken whereCreatedBy($value)
 * @method static Builder<static>|PagePreviewToken whereExpiresAt($value)
 * @method static Builder<static>|PagePreviewToken whereId($value)
 * @method static Builder<static>|PagePreviewToken wherePageId($value)
 * @method static Builder<static>|PagePreviewToken wherePageVersionId($value)
 * @method static Builder<static>|PagePreviewToken whereTokenHash($value)
 * @method static Builder<static>|PagePreviewToken whereUpdatedAt($value)
 * @mixin Model
 */
	class PagePreviewToken extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $page_id
 * @property string|null $section_type
 * @property string $layout
 * @property string|null $variant
 * @property array<string, mixed>|null $settings
 * @property int $position
 * @property bool $is_active
 * @property-read Page $page
 * @property-read Collection<int, PageBlock> $blocks
 * @property-read Collection<int, PageBlock> $allBlocks
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $all_blocks_count
 * @property-read int|null $blocks_count
 * @method static Builder<static>|PageSection newModelQuery()
 * @method static Builder<static>|PageSection newQuery()
 * @method static Builder<static>|PageSection query()
 * @method static Builder<static>|PageSection whereCreatedAt($value)
 * @method static Builder<static>|PageSection whereId($value)
 * @method static Builder<static>|PageSection whereIsActive($value)
 * @method static Builder<static>|PageSection whereLayout($value)
 * @method static Builder<static>|PageSection wherePageId($value)
 * @method static Builder<static>|PageSection wherePosition($value)
 * @method static Builder<static>|PageSection whereSectionType($value)
 * @method static Builder<static>|PageSection whereSettings($value)
 * @method static Builder<static>|PageSection whereUpdatedAt($value)
 * @method static Builder<static>|PageSection whereVariant($value)
 * @mixin Model
 */
	class PageSection extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $page_id
 * @property int $version_number
 * @property array<array-key, mixed> $snapshot Full page + content + sections snapshot
 * @property int|null $created_by
 * @property string|null $change_note
 * @property bool $is_autosave
 * @property string $source
 * @property int $is_published
 * @property string|null $published_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 * @property-read Page $page
 * @method static Builder<static>|PageVersion newModelQuery()
 * @method static Builder<static>|PageVersion newQuery()
 * @method static Builder<static>|PageVersion query()
 * @method static Builder<static>|PageVersion whereChangeNote($value)
 * @method static Builder<static>|PageVersion whereCreatedAt($value)
 * @method static Builder<static>|PageVersion whereCreatedBy($value)
 * @method static Builder<static>|PageVersion whereId($value)
 * @method static Builder<static>|PageVersion whereIsAutosave($value)
 * @method static Builder<static>|PageVersion whereIsPublished($value)
 * @method static Builder<static>|PageVersion wherePageId($value)
 * @method static Builder<static>|PageVersion wherePublishedAt($value)
 * @method static Builder<static>|PageVersion whereSnapshot($value)
 * @method static Builder<static>|PageVersion whereSource($value)
 * @method static Builder<static>|PageVersion whereUpdatedAt($value)
 * @method static Builder<static>|PageVersion whereVersionNumber($value)
 * @mixin Model
 */
	class PageVersion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property PaymentProviderEnum $provider
 * @property string|null $payment_method
 * @property string|null $provider_transaction_id
 * @property PaymentStatusEnum $status
 * @property int $amount
 * @property string $currency_code
 * @property array<array-key, mixed>|null $payload
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Order $order
 * @method static PaymentFactory factory($count = null, $state = [])
 * @method static Builder<static>|Payment newModelQuery()
 * @method static Builder<static>|Payment newQuery()
 * @method static Builder<static>|Payment query()
 * @method static Builder<static>|Payment whereAmount($value)
 * @method static Builder<static>|Payment whereCreatedAt($value)
 * @method static Builder<static>|Payment whereCurrencyCode($value)
 * @method static Builder<static>|Payment whereId($value)
 * @method static Builder<static>|Payment whereOrderId($value)
 * @method static Builder<static>|Payment wherePayload($value)
 * @method static Builder<static>|Payment wherePaymentMethod($value)
 * @method static Builder<static>|Payment whereProvider($value)
 * @method static Builder<static>|Payment whereProviderTransactionId($value)
 * @method static Builder<static>|Payment whereStatus($value)
 * @method static Builder<static>|Payment whereUpdatedAt($value)
 * @mixin Model
 */
	class Payment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $system_page_key
 * @property int $page_id
 * @property string|null $locale
 * @property int $revision
 * @property string $version_label
 * @property string $content_checksum
 * @property CarbonImmutable|null $effective_from
 * @property CarbonImmutable|null $published_at
 * @property bool $is_current
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|PolicyDocumentVersion current()
 * @method static Builder<static>|PolicyDocumentVersion newModelQuery()
 * @method static Builder<static>|PolicyDocumentVersion newQuery()
 * @method static Builder<static>|PolicyDocumentVersion query()
 * @mixin Model
 * @property-read \App\Models\Page $page
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereContentChecksum($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereEffectiveFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereIsCurrent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereLocale($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion wherePageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion wherePublishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereRevision($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereSystemPageKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PolicyDocumentVersion whereVersionLabel($value)
 */
	class PolicyDocumentVersion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_variant_id
 * @property int $price
 * @property CarbonImmutable $recorded_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $productVariant
 * @method static Builder<static>|PriceHistory newModelQuery()
 * @method static Builder<static>|PriceHistory newQuery()
 * @method static Builder<static>|PriceHistory query()
 * @method static Builder<static>|PriceHistory whereCreatedAt($value)
 * @method static Builder<static>|PriceHistory whereId($value)
 * @method static Builder<static>|PriceHistory wherePrice($value)
 * @method static Builder<static>|PriceHistory whereProductVariantId($value)
 * @method static Builder<static>|PriceHistory whereRecordedAt($value)
 * @method static Builder<static>|PriceHistory whereUpdatedAt($value)
 * @mixin Model
 */
	class PriceHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $user_id
 * @property int|null $processed_by_user_id
 * @property string $type
 * @property string $status
 * @property string|null $email
 * @property array<string, mixed>|null $payload
 * @property string|null $resolution_note
 * @property CarbonImmutable $requested_at
 * @property CarbonImmutable|null $resolved_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|PrivacyRequest newModelQuery()
 * @method static Builder<static>|PrivacyRequest newQuery()
 * @method static Builder<static>|PrivacyRequest query()
 * @mixin Model
 * @property-read \App\Models\User|null $processedByUser
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest wherePayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereProcessedByUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereRequestedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereResolutionNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereResolvedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyRequest whereUserId($value)
 */
	class PrivacyRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property bool $is_search_promoted
 * @property bool $is_featured
 * @property bool $is_active
 * @property-read ProductImage|null $thumbnail
 * @property int $product_type_id
 * @property int $category_id
 * @property int|null $brand_id
 * @property array<array-key, mixed>|null $description
 * @property array<array-key, mixed>|null $short_description
 * @property string|null $sku_prefix
 * @property bool $is_saleable
 * @property CarbonImmutable|null $available_from
 * @property CarbonImmutable|null $available_until
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ProductVariant> $activeVariants
 * @property-read int|null $active_variants_count
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Brand|null $brand
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Category $category
 * @property-read ProductVariant|null $defaultVariant
 * @property-read Collection<int, ProductFlag> $flags
 * @property-read int|null $flags_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, ProductImage> $images
 * @property-read int|null $images_count
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read ProductType $productType
 * @property-read Collection<int, Promotion> $promotions
 * @property-read int|null $promotions_count
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read int|null $reviews_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read int|null $variants_count
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 * @property-read Collection<int, WishlistItem> $wishlistItems
 * @property-read int|null $wishlist_items_count
 * @method static Builder<static>|Product available()
 * @method static ProductFactory factory($count = null, $state = [])
 * @method static Builder<static>|Product newModelQuery()
 * @method static Builder<static>|Product newQuery()
 * @method static Builder<static>|Product query()
 * @method static Builder<static>|Product whereAvailableFrom($value)
 * @method static Builder<static>|Product whereAvailableUntil($value)
 * @method static Builder<static>|Product whereBrandId($value)
 * @method static Builder<static>|Product whereCategoryId($value)
 * @method static Builder<static>|Product whereCreatedAt($value)
 * @method static Builder<static>|Product whereDescription($value)
 * @method static Builder<static>|Product whereId($value)
 * @method static Builder<static>|Product whereIsActive($value)
 * @method static Builder<static>|Product whereIsFeatured($value)
 * @method static Builder<static>|Product whereIsSaleable($value)
 * @method static Builder<static>|Product whereIsSearchPromoted($value)
 * @method static Builder<static>|Product whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Product whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Product whereLocale(string $column, string $locale)
 * @method static Builder<static>|Product whereLocales(string $column, array $locales)
 * @method static Builder<static>|Product whereMetaRobots($value)
 * @method static Builder<static>|Product whereName($value)
 * @method static Builder<static>|Product whereOgImage($value)
 * @method static Builder<static>|Product whereProductTypeId($value)
 * @method static Builder<static>|Product whereSeoDescription($value)
 * @method static Builder<static>|Product whereSeoTitle($value)
 * @method static Builder<static>|Product whereShortDescription($value)
 * @method static Builder<static>|Product whereSitemapExclude($value)
 * @method static Builder<static>|Product whereSkuPrefix($value)
 * @method static Builder<static>|Product whereSlug($value)
 * @method static Builder<static>|Product whereUpdatedAt($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Product extends \Eloquent implements \Spatie\MediaLibrary\HasMedia {}
}

namespace App\Models{
/**
 * @property Collection $items
 * @property int $discount_percentage
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $items_count
 * @property-read Product $product
 * @method static Builder<static>|ProductBundle newModelQuery()
 * @method static Builder<static>|ProductBundle newQuery()
 * @method static Builder<static>|ProductBundle query()
 * @method static Builder<static>|ProductBundle whereCreatedAt($value)
 * @method static Builder<static>|ProductBundle whereDescription($value)
 * @method static Builder<static>|ProductBundle whereDiscountPercentage($value)
 * @method static Builder<static>|ProductBundle whereId($value)
 * @method static Builder<static>|ProductBundle whereIsActive($value)
 * @method static Builder<static>|ProductBundle whereName($value)
 * @method static Builder<static>|ProductBundle whereProductId($value)
 * @method static Builder<static>|ProductBundle whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductBundle extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_variant_id
 * @property string $name
 * @property string $file_path
 * @property string $file_name
 * @property int $file_size
 * @property string|null $mime_type
 * @property int $position
 * @property-read ProductVariant $variant
 * @property-read Media|null $media
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|ProductDownload newModelQuery()
 * @method static Builder<static>|ProductDownload newQuery()
 * @method static Builder<static>|ProductDownload query()
 * @method static Builder<static>|ProductDownload whereCreatedAt($value)
 * @method static Builder<static>|ProductDownload whereFileName($value)
 * @method static Builder<static>|ProductDownload whereFilePath($value)
 * @method static Builder<static>|ProductDownload whereFileSize($value)
 * @method static Builder<static>|ProductDownload whereId($value)
 * @method static Builder<static>|ProductDownload whereMimeType($value)
 * @method static Builder<static>|ProductDownload whereName($value)
 * @method static Builder<static>|ProductDownload wherePosition($value)
 * @method static Builder<static>|ProductDownload whereProductVariantId($value)
 * @method static Builder<static>|ProductDownload whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductDownload extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_download_link_id
 * @property int|null $user_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductDownloadLink $link
 * @property-read User|null $user
 * @method static Builder<static>|ProductDownloadEvent newModelQuery()
 * @method static Builder<static>|ProductDownloadEvent newQuery()
 * @method static Builder<static>|ProductDownloadEvent query()
 * @method static Builder<static>|ProductDownloadEvent whereCreatedAt($value)
 * @method static Builder<static>|ProductDownloadEvent whereId($value)
 * @method static Builder<static>|ProductDownloadEvent whereIpAddress($value)
 * @method static Builder<static>|ProductDownloadEvent whereProductDownloadLinkId($value)
 * @method static Builder<static>|ProductDownloadEvent whereUpdatedAt($value)
 * @method static Builder<static>|ProductDownloadEvent whereUserAgent($value)
 * @method static Builder<static>|ProductDownloadEvent whereUserId($value)
 * @mixin Model
 */
	class ProductDownloadEvent extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_item_id
 * @property int $product_variant_id
 * @property string $token
 * @property Carbon|null $expires_at
 * @property int $download_count
 * @property int|null $max_downloads
 * @property-read OrderItem|null $orderItem
 * @property-read ProductVariant $variant
 * @property-read Collection<int, ProductDownloadEvent> $events
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $events_count
 * @method static Builder<static>|ProductDownloadLink newModelQuery()
 * @method static Builder<static>|ProductDownloadLink newQuery()
 * @method static Builder<static>|ProductDownloadLink query()
 * @method static Builder<static>|ProductDownloadLink whereCreatedAt($value)
 * @method static Builder<static>|ProductDownloadLink whereDownloadCount($value)
 * @method static Builder<static>|ProductDownloadLink whereExpiresAt($value)
 * @method static Builder<static>|ProductDownloadLink whereId($value)
 * @method static Builder<static>|ProductDownloadLink whereMaxDownloads($value)
 * @method static Builder<static>|ProductDownloadLink whereOrderItemId($value)
 * @method static Builder<static>|ProductDownloadLink whereProductVariantId($value)
 * @method static Builder<static>|ProductDownloadLink whereToken($value)
 * @method static Builder<static>|ProductDownloadLink whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductDownloadLink extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $color
 * @property string|null $description
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @method static Builder<static>|ProductFlag active()
 * @method static Builder<static>|ProductFlag newModelQuery()
 * @method static Builder<static>|ProductFlag newQuery()
 * @method static Builder<static>|ProductFlag ordered()
 * @method static Builder<static>|ProductFlag query()
 * @method static Builder<static>|ProductFlag whereColor($value)
 * @method static Builder<static>|ProductFlag whereCreatedAt($value)
 * @method static Builder<static>|ProductFlag whereDescription($value)
 * @method static Builder<static>|ProductFlag whereId($value)
 * @method static Builder<static>|ProductFlag whereIsActive($value)
 * @method static Builder<static>|ProductFlag whereName($value)
 * @method static Builder<static>|ProductFlag wherePosition($value)
 * @method static Builder<static>|ProductFlag whereSlug($value)
 * @method static Builder<static>|ProductFlag whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductFlag extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_id
 * @property ?int $variant_id
 * @property ?int $media_id
 * @property bool $is_thumbnail
 * @property int $position
 * @property ?string $alt_text
 * @property-read ?Media $media
 * @property-read string $path
 * @property int|null $product_variant_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Product $product
 * @property-read ProductVariant|null $variant
 * @method static Builder<static>|ProductImage newModelQuery()
 * @method static Builder<static>|ProductImage newQuery()
 * @method static Builder<static>|ProductImage query()
 * @method static Builder<static>|ProductImage whereCreatedAt($value)
 * @method static Builder<static>|ProductImage whereId($value)
 * @method static Builder<static>|ProductImage whereIsThumbnail($value)
 * @method static Builder<static>|ProductImage whereMediaId($value)
 * @method static Builder<static>|ProductImage wherePosition($value)
 * @method static Builder<static>|ProductImage whereProductId($value)
 * @method static Builder<static>|ProductImage whereProductVariantId($value)
 * @method static Builder<static>|ProductImage whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductImage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_id
 * @property int $customer_id
 * @property int|null $order_id
 * @property int $rating
 * @property string|null $title
 * @property string|null $body
 * @property ReviewStatusEnum $status
 * @property bool $is_verified_purchase
 * @property int $helpful_count
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Collection<int, ReviewHelpfulVote> $helpfulVotes
 * @property-read int|null $helpful_votes_count
 * @property-read Collection<int, ReviewImage> $images
 * @property-read int|null $images_count
 * @property-read Order|null $order
 * @property-read Product $product
 * @method static Builder<static>|ProductReview newModelQuery()
 * @method static Builder<static>|ProductReview newQuery()
 * @method static Builder<static>|ProductReview query()
 * @method static Builder<static>|ProductReview whereBody($value)
 * @method static Builder<static>|ProductReview whereCreatedAt($value)
 * @method static Builder<static>|ProductReview whereCustomerId($value)
 * @method static Builder<static>|ProductReview whereHelpfulCount($value)
 * @method static Builder<static>|ProductReview whereId($value)
 * @method static Builder<static>|ProductReview whereIsVerifiedPurchase($value)
 * @method static Builder<static>|ProductReview whereOrderId($value)
 * @method static Builder<static>|ProductReview whereProductId($value)
 * @method static Builder<static>|ProductReview whereRating($value)
 * @method static Builder<static>|ProductReview whereStatus($value)
 * @method static Builder<static>|ProductReview whereTitle($value)
 * @method static Builder<static>|ProductReview whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductReview extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property bool $has_variants
 * @property array<array-key, mixed>|null $variant_selection_attributes
 * @property bool $is_shippable
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Attribute> $attributes
 * @property-read int|null $attributes_count
 * @property-read Collection<int, ProductTypeAttribute> $productTypeAttributes
 * @property-read int|null $product_type_attributes_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @method static ProductTypeFactory factory($count = null, $state = [])
 * @method static Builder<static>|ProductType newModelQuery()
 * @method static Builder<static>|ProductType newQuery()
 * @method static Builder<static>|ProductType query()
 * @method static Builder<static>|ProductType whereCreatedAt($value)
 * @method static Builder<static>|ProductType whereHasVariants($value)
 * @method static Builder<static>|ProductType whereId($value)
 * @method static Builder<static>|ProductType whereIsShippable($value)
 * @method static Builder<static>|ProductType whereName($value)
 * @method static Builder<static>|ProductType whereSlug($value)
 * @method static Builder<static>|ProductType whereUpdatedAt($value)
 * @method static Builder<static>|ProductType whereVariantSelectionAttributes($value)
 * @mixin Model
 */
	class ProductType extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_type_id
 * @property int $attribute_id
 * @property bool $is_required
 * @property int $position
 * @property-read Attribute $attribute
 * @property-read ProductType $productType
 * @method static Builder<static>|ProductTypeAttribute newModelQuery()
 * @method static Builder<static>|ProductTypeAttribute newQuery()
 * @method static Builder<static>|ProductTypeAttribute query()
 * @method static Builder<static>|ProductTypeAttribute whereAttributeId($value)
 * @method static Builder<static>|ProductTypeAttribute whereId($value)
 * @method static Builder<static>|ProductTypeAttribute whereIsRequired($value)
 * @method static Builder<static>|ProductTypeAttribute wherePosition($value)
 * @method static Builder<static>|ProductTypeAttribute whereProductTypeId($value)
 * @mixin Model
 */
	class ProductTypeAttribute extends \Eloquent {}
}

namespace App\Models{
/**
 * Product Variant Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property int $product_id
 * @property int|null $tax_rate_id
 * @property string $sku
 * @property string|null $barcode
 * @property string|null $ean
 * @property string|null $upc
 * @property array<string, string>|string $name
 * @property int $price
 * @property int $cost_price
 * @property int|null $compare_at_price
 * @property float|null $weight
 * @property int $stock_quantity
 * @property int $stock_threshold
 * @property string $stock_status
 * @property bool $backorder_allowed
 * @property Carbon|null $available_at
 * @property bool $is_active
 * @property bool $is_default
 * @property bool $is_digital
 * @property int|null $download_limit
 * @property int|null $download_expiry_days
 * @property int $position
 * @property-read Product|null $product
 * @property-read TaxRate|null $taxRate
 * @property-read Collection<int, VariantAttributeValue> $attributeValues
 * @property-read Collection<int, ProductImage> $images
 * @property-read Collection<int, ProductDownload> $downloads
 * @property-read Collection<int, PriceHistory> $priceHistory
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $attribute_values_count
 * @property-read int|null $downloads_count
 * @property-read array $translatable_columns_from
 * @property-read int|null $images_count
 * @property-read int|null $price_history_count
 * @property-read Collection<int, ProductVariantPriceTier> $priceTiers
 * @property-read int|null $price_tiers_count
 * @property-read mixed $translations
 * @method static ProductVariantFactory factory($count = null, $state = [])
 * @method static ProductVariantBuilder<static>|ProductVariant newModelQuery()
 * @method static ProductVariantBuilder<static>|ProductVariant newQuery()
 * @method static ProductVariantBuilder<static>|ProductVariant query()
 * @method static array getActivePriceBounds()
 * @method static ProductVariantBuilder<static>|ProductVariant whereAvailableAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereBackorderAllowed($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereBarcode($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCompareAtPrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCostPrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCreatedAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereDownloadExpiryDays($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereDownloadLimit($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereEan($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsActive($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsDefault($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsDigital($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static ProductVariantBuilder<static>|ProductVariant whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static ProductVariantBuilder<static>|ProductVariant whereLocale(string $column, string $locale)
 * @method static ProductVariantBuilder<static>|ProductVariant whereLocales(string $column, array $locales)
 * @method static ProductVariantBuilder<static>|ProductVariant whereName($value)
 * @method static ProductVariantBuilder<static>|ProductVariant wherePosition($value)
 * @method static ProductVariantBuilder<static>|ProductVariant wherePrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereProductId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereSku($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockQuantity($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockStatus($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockThreshold($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereTaxRateId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereUpc($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereUpdatedAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereWeight($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class ProductVariant extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_variant_id
 * @property int $min_quantity
 * @property int|null $max_quantity
 * @property int $price
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $variant
 * @method static Builder<static>|ProductVariantPriceTier newModelQuery()
 * @method static Builder<static>|ProductVariantPriceTier newQuery()
 * @method static Builder<static>|ProductVariantPriceTier query()
 * @method static Builder<static>|ProductVariantPriceTier whereCreatedAt($value)
 * @method static Builder<static>|ProductVariantPriceTier whereId($value)
 * @method static Builder<static>|ProductVariantPriceTier whereMaxQuantity($value)
 * @method static Builder<static>|ProductVariantPriceTier whereMinQuantity($value)
 * @method static Builder<static>|ProductVariantPriceTier wherePrice($value)
 * @method static Builder<static>|ProductVariantPriceTier whereProductVariantId($value)
 * @method static Builder<static>|ProductVariantPriceTier whereUpdatedAt($value)
 * @mixin Model
 */
	class ProductVariantPriceTier extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $type
 * @property numeric|null $value
 * @property numeric|null $min_value
 * @property numeric|null $max_discount
 * @property string $apply_to
 * @property bool $is_active
 * @property bool $is_stackable
 * @property int $priority
 * @property CarbonImmutable|null $starts_at
 * @property CarbonImmutable|null $ends_at
 * @property array<array-key, mixed>|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @method static Builder<static>|Promotion active()
 * @method static PromotionFactory factory($count = null, $state = [])
 * @method static Builder<static>|Promotion newModelQuery()
 * @method static Builder<static>|Promotion newQuery()
 * @method static Builder<static>|Promotion ordered()
 * @method static Builder<static>|Promotion query()
 * @method static Builder<static>|Promotion whereApplyTo($value)
 * @method static Builder<static>|Promotion whereCreatedAt($value)
 * @method static Builder<static>|Promotion whereDescription($value)
 * @method static Builder<static>|Promotion whereEndsAt($value)
 * @method static Builder<static>|Promotion whereId($value)
 * @method static Builder<static>|Promotion whereIsActive($value)
 * @method static Builder<static>|Promotion whereIsStackable($value)
 * @method static Builder<static>|Promotion whereMaxDiscount($value)
 * @method static Builder<static>|Promotion whereMetadata($value)
 * @method static Builder<static>|Promotion whereMinValue($value)
 * @method static Builder<static>|Promotion whereName($value)
 * @method static Builder<static>|Promotion wherePriority($value)
 * @method static Builder<static>|Promotion whereSlug($value)
 * @method static Builder<static>|Promotion whereStartsAt($value)
 * @method static Builder<static>|Promotion whereType($value)
 * @method static Builder<static>|Promotion whereUpdatedAt($value)
 * @method static Builder<static>|Promotion whereValue($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Promotion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $endpoint
 * @property string|null $public_key
 * @property string|null $auth_token
 * @property string|null $content_encoding
 * @property int|null $user_id
 * @property string|null $user_agent
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $user
 * @method static Builder<static>|PushSubscription active()
 * @method static Builder<static>|PushSubscription newModelQuery()
 * @method static Builder<static>|PushSubscription newQuery()
 * @method static Builder<static>|PushSubscription query()
 * @method static Builder<static>|PushSubscription whereAuthToken($value)
 * @method static Builder<static>|PushSubscription whereContentEncoding($value)
 * @method static Builder<static>|PushSubscription whereCreatedAt($value)
 * @method static Builder<static>|PushSubscription whereEndpoint($value)
 * @method static Builder<static>|PushSubscription whereId($value)
 * @method static Builder<static>|PushSubscription whereIsActive($value)
 * @method static Builder<static>|PushSubscription wherePublicKey($value)
 * @method static Builder<static>|PushSubscription whereUpdatedAt($value)
 * @method static Builder<static>|PushSubscription whereUserAgent($value)
 * @method static Builder<static>|PushSubscription whereUserId($value)
 * @mixin Model
 */
	final class PushSubscription extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $affiliate_code_id
 * @property int|null $order_id
 * @property int|null $referred_user_id
 * @property int $order_total Order total in cents at time of referral
 * @property int $commission_amount Commission in cents
 * @property string $status
 * @property CarbonImmutable|null $paid_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read AffiliateCode $affiliateCode
 * @property-read Order|null $order
 * @property-read User|null $referredUser
 * @method static Builder<static>|Referral newModelQuery()
 * @method static Builder<static>|Referral newQuery()
 * @method static Builder<static>|Referral query()
 * @method static Builder<static>|Referral whereAffiliateCodeId($value)
 * @method static Builder<static>|Referral whereCommissionAmount($value)
 * @method static Builder<static>|Referral whereCreatedAt($value)
 * @method static Builder<static>|Referral whereId($value)
 * @method static Builder<static>|Referral whereOrderId($value)
 * @method static Builder<static>|Referral whereOrderTotal($value)
 * @method static Builder<static>|Referral wherePaidAt($value)
 * @method static Builder<static>|Referral whereReferredUserId($value)
 * @method static Builder<static>|Referral whereStatus($value)
 * @method static Builder<static>|Referral whereUpdatedAt($value)
 * @mixin Model
 */
	class Referral extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $return_id
 * @property int $order_item_id
 * @property int $quantity
 * @property ReturnItemConditionEnum|null $condition
 * @property string|null $notes
 * @property-read OrderItem $orderItem
 * @property-read ReturnRequest $return
 * @method static Builder<static>|ReturnItem newModelQuery()
 * @method static Builder<static>|ReturnItem newQuery()
 * @method static Builder<static>|ReturnItem query()
 * @method static Builder<static>|ReturnItem whereCondition($value)
 * @method static Builder<static>|ReturnItem whereId($value)
 * @method static Builder<static>|ReturnItem whereNotes($value)
 * @method static Builder<static>|ReturnItem whereOrderItemId($value)
 * @method static Builder<static>|ReturnItem whereQuantity($value)
 * @method static Builder<static>|ReturnItem whereReturnId($value)
 * @mixin Model
 */
	class ReturnItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reference_number
 * @property ReturnTypeEnum $return_type
 * @property ReturnStatusEnum $status
 * @property string|null $reason
 * @property string|null $customer_notes
 * @property string|null $admin_notes
 * @property int|null $refund_amount
 * @property string|null $return_tracking_number
 * @property Carbon $created_at
 * @property Collection $items
 * @property-read Order $order
 * @property int $order_id
 * @property string|null $return_label_url
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $items_count
 * @property-read Collection<int, ReturnStatusHistory> $statusHistory
 * @property-read int|null $status_history_count
 * @method static Builder<static>|ReturnRequest newModelQuery()
 * @method static Builder<static>|ReturnRequest newQuery()
 * @method static Builder<static>|ReturnRequest query()
 * @method static Builder<static>|ReturnRequest whereAdminNotes($value)
 * @method static Builder<static>|ReturnRequest whereCreatedAt($value)
 * @method static Builder<static>|ReturnRequest whereCustomerNotes($value)
 * @method static Builder<static>|ReturnRequest whereId($value)
 * @method static Builder<static>|ReturnRequest whereOrderId($value)
 * @method static Builder<static>|ReturnRequest whereReason($value)
 * @method static Builder<static>|ReturnRequest whereReferenceNumber($value)
 * @method static Builder<static>|ReturnRequest whereRefundAmount($value)
 * @method static Builder<static>|ReturnRequest whereReturnLabelUrl($value)
 * @method static Builder<static>|ReturnRequest whereReturnTrackingNumber($value)
 * @method static Builder<static>|ReturnRequest whereReturnType($value)
 * @method static Builder<static>|ReturnRequest whereStatus($value)
 * @method static Builder<static>|ReturnRequest whereUpdatedAt($value)
 * @mixin Model
 */
	class ReturnRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $return_id
 * @property string $previous_status
 * @property string $new_status
 * @property string $changed_by
 * @property string|null $notes
 * @property CarbonImmutable $changed_at
 * @property-read ReturnRequest $return
 * @method static Builder<static>|ReturnStatusHistory newModelQuery()
 * @method static Builder<static>|ReturnStatusHistory newQuery()
 * @method static Builder<static>|ReturnStatusHistory query()
 * @method static Builder<static>|ReturnStatusHistory whereChangedAt($value)
 * @method static Builder<static>|ReturnStatusHistory whereChangedBy($value)
 * @method static Builder<static>|ReturnStatusHistory whereId($value)
 * @method static Builder<static>|ReturnStatusHistory whereNewStatus($value)
 * @method static Builder<static>|ReturnStatusHistory whereNotes($value)
 * @method static Builder<static>|ReturnStatusHistory wherePreviousStatus($value)
 * @method static Builder<static>|ReturnStatusHistory whereReturnId($value)
 * @mixin Model
 */
	class ReturnStatusHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property string $type
 * @property array<string, mixed>|null $configuration
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $relations_config
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, PageBlock> $pageBlocks
 * @property-read int|null $page_blocks_count
 * @method static Builder<static>|ReusableBlock newModelQuery()
 * @method static Builder<static>|ReusableBlock newQuery()
 * @method static Builder<static>|ReusableBlock query()
 * @method static Builder<static>|ReusableBlock whereConfiguration($value)
 * @method static Builder<static>|ReusableBlock whereCreatedAt($value)
 * @method static Builder<static>|ReusableBlock whereDescription($value)
 * @method static Builder<static>|ReusableBlock whereId($value)
 * @method static Builder<static>|ReusableBlock whereIsActive($value)
 * @method static Builder<static>|ReusableBlock whereName($value)
 * @method static Builder<static>|ReusableBlock whereRelationsConfig($value)
 * @method static Builder<static>|ReusableBlock whereType($value)
 * @method static Builder<static>|ReusableBlock whereUpdatedAt($value)
 * @mixin Model
 */
	class ReusableBlock extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_review_id
 * @property int $customer_id
 * @property bool $is_helpful
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductReview|null $review
 * @method static Builder<static>|ReviewHelpfulVote newModelQuery()
 * @method static Builder<static>|ReviewHelpfulVote newQuery()
 * @method static Builder<static>|ReviewHelpfulVote query()
 * @method static Builder<static>|ReviewHelpfulVote whereCreatedAt($value)
 * @method static Builder<static>|ReviewHelpfulVote whereCustomerId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereIsHelpful($value)
 * @method static Builder<static>|ReviewHelpfulVote whereProductReviewId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereUpdatedAt($value)
 * @mixin Model
 * @property-read \App\Models\Customer|null $customer
 */
	class ReviewHelpfulVote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_review_id
 * @property string $path
 * @property string|null $alt_text
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductReview|null $review
 * @method static Builder<static>|ReviewImage newModelQuery()
 * @method static Builder<static>|ReviewImage newQuery()
 * @method static Builder<static>|ReviewImage query()
 * @method static Builder<static>|ReviewImage whereAltText($value)
 * @method static Builder<static>|ReviewImage whereCreatedAt($value)
 * @method static Builder<static>|ReviewImage whereId($value)
 * @method static Builder<static>|ReviewImage wherePath($value)
 * @method static Builder<static>|ReviewImage wherePosition($value)
 * @method static Builder<static>|ReviewImage whereProductReviewId($value)
 * @method static Builder<static>|ReviewImage whereUpdatedAt($value)
 * @mixin Model
 */
	class ReviewImage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $query
 * @property int $results_count
 * @property bool $is_autocomplete
 * @property string|null $locale
 * @property string|null $searcher_type
 * @property int|null $searcher_id
 * @property string|null $ip
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Model|null $searcher
 * @method static Builder<static>|SearchLog newModelQuery()
 * @method static Builder<static>|SearchLog newQuery()
 * @method static Builder<static>|SearchLog query()
 * @method static Builder<static>|SearchLog whereCreatedAt($value)
 * @method static Builder<static>|SearchLog whereId($value)
 * @method static Builder<static>|SearchLog whereIp($value)
 * @method static Builder<static>|SearchLog whereIsAutocomplete($value)
 * @method static Builder<static>|SearchLog whereLocale($value)
 * @method static Builder<static>|SearchLog whereQuery($value)
 * @method static Builder<static>|SearchLog whereResultsCount($value)
 * @method static Builder<static>|SearchLog whereSearcherId($value)
 * @method static Builder<static>|SearchLog whereSearcherType($value)
 * @method static Builder<static>|SearchLog whereUpdatedAt($value)
 * @mixin Model
 */
	final class SearchLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $term
 * @property array<array-key, mixed> $synonyms
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|SearchSynonym newModelQuery()
 * @method static Builder<static>|SearchSynonym newQuery()
 * @method static Builder<static>|SearchSynonym query()
 * @method static Builder<static>|SearchSynonym whereCreatedAt($value)
 * @method static Builder<static>|SearchSynonym whereId($value)
 * @method static Builder<static>|SearchSynonym whereIsActive($value)
 * @method static Builder<static>|SearchSynonym whereSynonyms($value)
 * @method static Builder<static>|SearchSynonym whereTerm($value)
 * @method static Builder<static>|SearchSynonym whereUpdatedAt($value)
 * @mixin Model
 */
	class SearchSynonym extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $category
 * @property string|null $thumbnail
 * @property array<string, mixed> $snapshot
 * @property int|null $created_by
 * @property bool $is_global
 * @property int $usage_count
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 * @method static Builder<static>|SectionTemplate newModelQuery()
 * @method static Builder<static>|SectionTemplate newQuery()
 * @method static Builder<static>|SectionTemplate query()
 * @method static Builder<static>|SectionTemplate whereCategory($value)
 * @method static Builder<static>|SectionTemplate whereCreatedAt($value)
 * @method static Builder<static>|SectionTemplate whereCreatedBy($value)
 * @method static Builder<static>|SectionTemplate whereDescription($value)
 * @method static Builder<static>|SectionTemplate whereId($value)
 * @method static Builder<static>|SectionTemplate whereIsGlobal($value)
 * @method static Builder<static>|SectionTemplate whereName($value)
 * @method static Builder<static>|SectionTemplate whereSnapshot($value)
 * @method static Builder<static>|SectionTemplate whereThumbnail($value)
 * @method static Builder<static>|SectionTemplate whereUpdatedAt($value)
 * @method static Builder<static>|SectionTemplate whereUsageCount($value)
 * @mixin Model
 */
	class SectionTemplate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $group
 * @property string $key
 * @property string|null $label
 * @property mixed $value
 * @property SettingTypeEnum $type
 * @property string|null $description
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @method static SettingBuilder<static>|Setting newModelQuery()
 * @method static SettingBuilder<static>|Setting newQuery()
 * @method static SettingBuilder<static>|Setting query()
 * @method static Setting|null findByGroupAndKey(string $group, string $key)
 * @method static Collection getPublicSettings()
 * @method static SettingBuilder<static>|Setting whereCreatedAt($value)
 * @method static SettingBuilder<static>|Setting whereDescription($value)
 * @method static SettingBuilder<static>|Setting whereGroup($value)
 * @method static SettingBuilder<static>|Setting whereId($value)
 * @method static SettingBuilder<static>|Setting whereIsPublic($value)
 * @method static SettingBuilder<static>|Setting whereKey($value)
 * @method static SettingBuilder<static>|Setting whereLabel($value)
 * @method static SettingBuilder<static>|Setting whereType($value)
 * @method static SettingBuilder<static>|Setting whereUpdatedAt($value)
 * @method static SettingBuilder<static>|Setting whereValue($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Setting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $source_cart_id
 * @property int|null $customer_id
 * @property string $public_token
 * @property string $currency_code
 * @property string|null $locale
 * @property string|null $discount_code
 * @property array<string, mixed> $snapshot
 * @property CarbonImmutable|null $expires_at
 * @property int $uses_count
 * @property CarbonImmutable|null $last_used_at
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Cart|null $sourceCart
 * @property-read Customer|null $customer
 * @method static SharedCartFactory factory($count = null, $state = [])
 * @method static Builder<static>|SharedCart newModelQuery()
 * @method static Builder<static>|SharedCart newQuery()
 * @method static Builder<static>|SharedCart query()
 * @method static Builder<static>|SharedCart whereCreatedAt($value)
 * @method static Builder<static>|SharedCart whereCurrencyCode($value)
 * @method static Builder<static>|SharedCart whereCustomerId($value)
 * @method static Builder<static>|SharedCart whereDiscountCode($value)
 * @method static Builder<static>|SharedCart whereExpiresAt($value)
 * @method static Builder<static>|SharedCart whereId($value)
 * @method static Builder<static>|SharedCart whereIsActive($value)
 * @method static Builder<static>|SharedCart whereLastUsedAt($value)
 * @method static Builder<static>|SharedCart whereLocale($value)
 * @method static Builder<static>|SharedCart wherePublicToken($value)
 * @method static Builder<static>|SharedCart whereSnapshot($value)
 * @method static Builder<static>|SharedCart whereSourceCartId($value)
 * @method static Builder<static>|SharedCart whereUpdatedAt($value)
 * @method static Builder<static>|SharedCart whereUsesCount($value)
 * @mixin Model
 */
	class SharedCart extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $tracking_url
 * @property int $order_id
 * @property int|null $shipping_method_id
 * @property string|null $carrier
 * @property string|null $provider_shipment_id
 * @property string|null $tracking_number
 * @property string|null $label_url
 * @property ShipmentStatusEnum $status
 * @property string|null $pickup_point_id
 * @property array<array-key, mixed>|null $carrier_payload
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ShipmentItem> $items
 * @property-read int|null $items_count
 * @property-read Order $order
 * @property-read ShippingMethod|null $shippingMethod
 * @method static ShipmentFactory factory($count = null, $state = [])
 * @method static Builder<static>|Shipment newModelQuery()
 * @method static Builder<static>|Shipment newQuery()
 * @method static Builder<static>|Shipment query()
 * @method static Builder<static>|Shipment whereCarrier($value)
 * @method static Builder<static>|Shipment whereCarrierPayload($value)
 * @method static Builder<static>|Shipment whereCreatedAt($value)
 * @method static Builder<static>|Shipment whereId($value)
 * @method static Builder<static>|Shipment whereLabelUrl($value)
 * @method static Builder<static>|Shipment whereOrderId($value)
 * @method static Builder<static>|Shipment wherePickupPointId($value)
 * @method static Builder<static>|Shipment whereProviderShipmentId($value)
 * @method static Builder<static>|Shipment whereShippingMethodId($value)
 * @method static Builder<static>|Shipment whereStatus($value)
 * @method static Builder<static>|Shipment whereTrackingNumber($value)
 * @method static Builder<static>|Shipment whereTrackingUrl($value)
 * @method static Builder<static>|Shipment whereUpdatedAt($value)
 * @mixin Model
 */
	class Shipment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $shipment_id
 * @property int $order_item_id
 * @property int $quantity
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read OrderItem $orderItem
 * @property-read Shipment $shipment
 * @method static Builder<static>|ShipmentItem newModelQuery()
 * @method static Builder<static>|ShipmentItem newQuery()
 * @method static Builder<static>|ShipmentItem query()
 * @method static Builder<static>|ShipmentItem whereCreatedAt($value)
 * @method static Builder<static>|ShipmentItem whereId($value)
 * @method static Builder<static>|ShipmentItem whereOrderItemId($value)
 * @method static Builder<static>|ShipmentItem whereQuantity($value)
 * @method static Builder<static>|ShipmentItem whereShipmentId($value)
 * @method static Builder<static>|ShipmentItem whereUpdatedAt($value)
 * @mixin Model
 */
	class ShipmentItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property float $base_price
 * @property bool $is_active
 * @property float|null $max_length_cm
 * @property float|null $max_width_cm
 * @property float|null $max_depth_cm
 * @property Collection $restrictedProducts
 * @property Collection $restrictedCategories
 * @property ShippingCarrierEnum $carrier
 * @property array<array-key, mixed>|null $description
 * @property numeric|null $min_weight
 * @property numeric $max_weight
 * @property bool $requires_signature
 * @property bool $insurance_available
 * @property int|null $min_order_value
 * @property int|null $free_shipping_threshold
 * @property int $price_per_kg
 * @property int|null $estimated_days_min
 * @property int|null $estimated_days_max
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read array $translatable_columns_from
 * @property-read int|null $restricted_categories_count
 * @property-read int|null $restricted_products_count
 * @property-read Collection<int, Shipment> $shipments
 * @property-read int|null $shipments_count
 * @property-read mixed $translations
 * @method static ShippingMethodFactory factory($count = null, $state = [])
 * @method static Builder<static>|ShippingMethod newModelQuery()
 * @method static Builder<static>|ShippingMethod newQuery()
 * @method static Builder<static>|ShippingMethod query()
 * @method static Builder<static>|ShippingMethod whereBasePrice($value)
 * @method static Builder<static>|ShippingMethod whereCarrier($value)
 * @method static Builder<static>|ShippingMethod whereCreatedAt($value)
 * @method static Builder<static>|ShippingMethod whereDescription($value)
 * @method static Builder<static>|ShippingMethod whereEstimatedDaysMax($value)
 * @method static Builder<static>|ShippingMethod whereEstimatedDaysMin($value)
 * @method static Builder<static>|ShippingMethod whereFreeShippingThreshold($value)
 * @method static Builder<static>|ShippingMethod whereId($value)
 * @method static Builder<static>|ShippingMethod whereInsuranceAvailable($value)
 * @method static Builder<static>|ShippingMethod whereIsActive($value)
 * @method static Builder<static>|ShippingMethod whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|ShippingMethod whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|ShippingMethod whereLocale(string $column, string $locale)
 * @method static Builder<static>|ShippingMethod whereLocales(string $column, array $locales)
 * @method static Builder<static>|ShippingMethod whereMaxDepthCm($value)
 * @method static Builder<static>|ShippingMethod whereMaxLengthCm($value)
 * @method static Builder<static>|ShippingMethod whereMaxWeight($value)
 * @method static Builder<static>|ShippingMethod whereMaxWidthCm($value)
 * @method static Builder<static>|ShippingMethod whereMinOrderValue($value)
 * @method static Builder<static>|ShippingMethod whereMinWeight($value)
 * @method static Builder<static>|ShippingMethod whereName($value)
 * @method static Builder<static>|ShippingMethod wherePricePerKg($value)
 * @method static Builder<static>|ShippingMethod whereRequiresSignature($value)
 * @method static Builder<static>|ShippingMethod whereUpdatedAt($value)
 * @mixin Model
 * @property int|null $tax_rate_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read \App\Models\TaxRate|null $taxRate
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingMethod whereTaxRateId($value)
 */
	class ShippingMethod extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $base_rate
 * @property int $per_kg_rate
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ShippingZoneCountry> $countries
 * @property-read int|null $countries_count
 * @method static Builder<static>|ShippingZone newModelQuery()
 * @method static Builder<static>|ShippingZone newQuery()
 * @method static Builder<static>|ShippingZone query()
 * @method static Builder<static>|ShippingZone whereBaseRate($value)
 * @method static Builder<static>|ShippingZone whereCreatedAt($value)
 * @method static Builder<static>|ShippingZone whereDescription($value)
 * @method static Builder<static>|ShippingZone whereId($value)
 * @method static Builder<static>|ShippingZone whereIsActive($value)
 * @method static Builder<static>|ShippingZone whereName($value)
 * @method static Builder<static>|ShippingZone wherePerKgRate($value)
 * @method static Builder<static>|ShippingZone whereUpdatedAt($value)
 * @mixin Model
 */
	class ShippingZone extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $shipping_zone_id
 * @property string $country_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ShippingZone $shippingZone
 * @method static Builder<static>|ShippingZoneCountry newModelQuery()
 * @method static Builder<static>|ShippingZoneCountry newQuery()
 * @method static Builder<static>|ShippingZoneCountry query()
 * @method static Builder<static>|ShippingZoneCountry whereCountryCode($value)
 * @method static Builder<static>|ShippingZoneCountry whereCreatedAt($value)
 * @method static Builder<static>|ShippingZoneCountry whereId($value)
 * @method static Builder<static>|ShippingZoneCountry whereShippingZoneId($value)
 * @method static Builder<static>|ShippingZoneCountry whereUpdatedAt($value)
 * @mixin Model
 */
	class ShippingZoneCountry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $address
 * @property string $city
 * @property string $country
 * @property string|null $phone
 * @property string|null $email
 * @property array<array-key, mixed>|null $opening_hours
 * @property numeric $lat
 * @property numeric $lng
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static Builder<static>|Store active()
 * @method static StoreFactory factory($count = null, $state = [])
 * @method static Builder<static>|Store newModelQuery()
 * @method static Builder<static>|Store newQuery()
 * @method static Builder<static>|Store query()
 * @method static Builder<static>|Store whereAddress($value)
 * @method static Builder<static>|Store whereCity($value)
 * @method static Builder<static>|Store whereCountry($value)
 * @method static Builder<static>|Store whereCreatedAt($value)
 * @method static Builder<static>|Store whereEmail($value)
 * @method static Builder<static>|Store whereId($value)
 * @method static Builder<static>|Store whereIsActive($value)
 * @method static Builder<static>|Store whereLat($value)
 * @method static Builder<static>|Store whereLng($value)
 * @method static Builder<static>|Store whereName($value)
 * @method static Builder<static>|Store whereOpeningHours($value)
 * @method static Builder<static>|Store wherePhone($value)
 * @method static Builder<static>|Store whereSlug($value)
 * @method static Builder<static>|Store whereUpdatedAt($value)
 * @mixin Model
 */
	class Store extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property SubscriptionStatusEnum $status
 * @property Carbon|null $trial_ends_at
 * @property Carbon|null $expires_at
 * @property bool $auto_renew
 * @property int $billing_cycle_count
 * @property SubscriptionPlan $plan
 * @property int $customer_id
 * @property int $subscription_plan_id
 * @property CarbonImmutable $starts_at
 * @property CarbonImmutable|null $cancelled_at
 * @property CarbonImmutable|null $paused_at
 * @property CarbonImmutable|null $next_billing_at
 * @property int $billing_price
 * @property string|null $payment_method_id
 * @property int $Billing_cycle_count
 * @property array<array-key, mixed>|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Collection<int, Order> $orders
 * @property-read int|null $orders_count
 * @method static Builder<static>|Subscription active()
 * @method static Builder<static>|Subscription expired()
 * @method static Builder<static>|Subscription newModelQuery()
 * @method static Builder<static>|Subscription newQuery()
 * @method static Builder<static>|Subscription query()
 * @method static Builder<static>|Subscription whereAutoRenew($value)
 * @method static Builder<static>|Subscription whereBillingCycleCount($value)
 * @method static Builder<static>|Subscription whereBillingPrice($value)
 * @method static Builder<static>|Subscription whereCancelledAt($value)
 * @method static Builder<static>|Subscription whereCreatedAt($value)
 * @method static Builder<static>|Subscription whereCustomerId($value)
 * @method static Builder<static>|Subscription whereExpiresAt($value)
 * @method static Builder<static>|Subscription whereId($value)
 * @method static Builder<static>|Subscription whereMetadata($value)
 * @method static Builder<static>|Subscription whereNextBillingAt($value)
 * @method static Builder<static>|Subscription wherePausedAt($value)
 * @method static Builder<static>|Subscription wherePaymentMethodId($value)
 * @method static Builder<static>|Subscription whereStartsAt($value)
 * @method static Builder<static>|Subscription whereStatus($value)
 * @method static Builder<static>|Subscription whereSubscriptionPlanId($value)
 * @method static Builder<static>|Subscription whereTrialEndsAt($value)
 * @method static Builder<static>|Subscription whereUpdatedAt($value)
 * @mixin Model
 */
	final class Subscription extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $price
 * @property string $currency
 * @property string $billing_period
 * @property int $billing_cycle
 * @property int $trial_days
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $features
 * @property bool $is_active
 * @property int $sort_order
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Subscription> $subscriptions
 * @property-read int|null $subscriptions_count
 * @method static Builder<static>|SubscriptionPlan newModelQuery()
 * @method static Builder<static>|SubscriptionPlan newQuery()
 * @method static Builder<static>|SubscriptionPlan query()
 * @method static Builder<static>|SubscriptionPlan whereBillingCycle($value)
 * @method static Builder<static>|SubscriptionPlan whereBillingPeriod($value)
 * @method static Builder<static>|SubscriptionPlan whereCreatedAt($value)
 * @method static Builder<static>|SubscriptionPlan whereCurrency($value)
 * @method static Builder<static>|SubscriptionPlan whereDescription($value)
 * @method static Builder<static>|SubscriptionPlan whereFeatures($value)
 * @method static Builder<static>|SubscriptionPlan whereId($value)
 * @method static Builder<static>|SubscriptionPlan whereIsActive($value)
 * @method static Builder<static>|SubscriptionPlan whereName($value)
 * @method static Builder<static>|SubscriptionPlan wherePrice($value)
 * @method static Builder<static>|SubscriptionPlan whereSortOrder($value)
 * @method static Builder<static>|SubscriptionPlan whereTrialDays($value)
 * @method static Builder<static>|SubscriptionPlan whereUpdatedAt($value)
 * @mixin Model
 */
	final class SubscriptionPlan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $title
 * @property string $shortcut
 * @property string $body
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @method static SupportCannedResponseFactory factory($count = null, $state = [])
 * @method static Builder<static>|SupportCannedResponse newModelQuery()
 * @method static Builder<static>|SupportCannedResponse newQuery()
 * @method static Builder<static>|SupportCannedResponse query()
 * @method static Builder<static>|SupportCannedResponse whereBody($value)
 * @method static Builder<static>|SupportCannedResponse whereCreatedAt($value)
 * @method static Builder<static>|SupportCannedResponse whereId($value)
 * @method static Builder<static>|SupportCannedResponse whereShortcut($value)
 * @method static Builder<static>|SupportCannedResponse whereTitle($value)
 * @method static Builder<static>|SupportCannedResponse whereUpdatedAt($value)
 * @mixin Model
 */
	class SupportCannedResponse extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $token
 * @property int|null $customer_id
 * @property int|null $assigned_to
 * @property string|null $email
 * @property string|null $name
 * @property string $subject
 * @property SupportConversationStatusEnum $status
 * @property SupportChannelEnum $channel
 * @property CarbonImmutable|null $last_reply_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $assignedTo
 * @property-read Customer|null $customer
 * @property-read Collection<int, SupportMessage> $messages
 * @property-read int|null $messages_count
 * @property-read Collection<int, SupportMessage> $unreadMessages
 * @property-read int|null $unread_messages_count
 * @method static SupportConversationFactory factory($count = null, $state = [])
 * @method static Builder<static>|SupportConversation newModelQuery()
 * @method static Builder<static>|SupportConversation newQuery()
 * @method static Builder<static>|SupportConversation query()
 * @method static Builder<static>|SupportConversation whereAssignedTo($value)
 * @method static Builder<static>|SupportConversation whereChannel($value)
 * @method static Builder<static>|SupportConversation whereCreatedAt($value)
 * @method static Builder<static>|SupportConversation whereCustomerId($value)
 * @method static Builder<static>|SupportConversation whereEmail($value)
 * @method static Builder<static>|SupportConversation whereId($value)
 * @method static Builder<static>|SupportConversation whereLastReplyAt($value)
 * @method static Builder<static>|SupportConversation whereName($value)
 * @method static Builder<static>|SupportConversation whereStatus($value)
 * @method static Builder<static>|SupportConversation whereSubject($value)
 * @method static Builder<static>|SupportConversation whereToken($value)
 * @method static Builder<static>|SupportConversation whereUpdatedAt($value)
 * @mixin Model
 */
	class SupportConversation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $conversation_id
 * @property string $sender_type
 * @property string $sender_name
 * @property string $body
 * @property bool $is_internal
 * @property CarbonImmutable|null $read_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read SupportConversation $conversation
 * @method static SupportMessageFactory factory($count = null, $state = [])
 * @method static Builder<static>|SupportMessage newModelQuery()
 * @method static Builder<static>|SupportMessage newQuery()
 * @method static Builder<static>|SupportMessage query()
 * @method static Builder<static>|SupportMessage whereBody($value)
 * @method static Builder<static>|SupportMessage whereConversationId($value)
 * @method static Builder<static>|SupportMessage whereCreatedAt($value)
 * @method static Builder<static>|SupportMessage whereId($value)
 * @method static Builder<static>|SupportMessage whereIsInternal($value)
 * @method static Builder<static>|SupportMessage whereReadAt($value)
 * @method static Builder<static>|SupportMessage whereSenderName($value)
 * @method static Builder<static>|SupportMessage whereSenderType($value)
 * @method static Builder<static>|SupportMessage whereUpdatedAt($value)
 * @mixin Model
 */
	class SupportMessage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, BlogPost> $blogPosts
 * @property-read int|null $blog_posts_count
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @method static Builder<static>|Tag newModelQuery()
 * @method static Builder<static>|Tag newQuery()
 * @method static Builder<static>|Tag query()
 * @method static Builder<static>|Tag whereCreatedAt($value)
 * @method static Builder<static>|Tag whereId($value)
 * @method static Builder<static>|Tag whereName($value)
 * @method static Builder<static>|Tag whereSlug($value)
 * @method static Builder<static>|Tag whereUpdatedAt($value)
 * @mixin Model
 */
	class Tag extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $rate
 * @property string|null $country_code
 * @property int|null $tax_zone_id
 * @property bool $is_active
 * @property bool $is_default
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read int|null $variants_count
 * @property-read TaxZone|null $taxZone
 * @method static Builder<static>|TaxRate newModelQuery()
 * @method static Builder<static>|TaxRate newQuery()
 * @method static Builder<static>|TaxRate query()
 * @method static Builder<static>|TaxRate whereCountryCode($value)
 * @method static Builder<static>|TaxRate whereCreatedAt($value)
 * @method static Builder<static>|TaxRate whereId($value)
 * @method static Builder<static>|TaxRate whereIsActive($value)
 * @method static Builder<static>|TaxRate whereIsDefault($value)
 * @method static Builder<static>|TaxRate whereName($value)
 * @method static Builder<static>|TaxRate whereRate($value)
 * @method static Builder<static>|TaxRate whereUpdatedAt($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxRate whereTaxZoneId($value)
 */
	class TaxRate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, TaxZoneCountry> $countries
 * @property-read Collection<int, TaxRate> $taxRates
 * @mixin Model
 * @property-read int|null $countries_count
 * @property-read int|null $tax_rates_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZone whereUpdatedAt($value)
 */
	class TaxZone extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tax_zone_id
 * @property string $country_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read TaxZone $taxZone
 * @mixin Model
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry whereCountryCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry whereTaxZoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaxZoneCountry whereUpdatedAt($value)
 */
	class TaxZoneCountry extends \Eloquent {}
}

namespace App\Models{
/**
 * Theme model representing UI/themes configuration stored in the database.
 *
 * @property array<string, mixed>|null $tokens
 * @property array<string, mixed>|null $typography
 * @property array<string, mixed>|null $spacing
 * @property array<string, mixed>|null $buttons
 * @property array<string, mixed>|null $containers
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $preview_image
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 * @method static ThemeFactory factory($count = null, $state = [])
 * @method static Builder<static>|Theme newModelQuery()
 * @method static Builder<static>|Theme newQuery()
 * @method static Builder<static>|Theme query()
 * @method static Builder<static>|Theme whereButtons($value)
 * @method static Builder<static>|Theme whereContainers($value)
 * @method static Builder<static>|Theme whereCreatedAt($value)
 * @method static Builder<static>|Theme whereDescription($value)
 * @method static Builder<static>|Theme whereId($value)
 * @method static Builder<static>|Theme whereIsActive($value)
 * @method static Builder<static>|Theme whereName($value)
 * @method static Builder<static>|Theme wherePreviewImage($value)
 * @method static Builder<static>|Theme whereSettings($value)
 * @method static Builder<static>|Theme whereSlug($value)
 * @method static Builder<static>|Theme whereSpacing($value)
 * @method static Builder<static>|Theme whereTokens($value)
 * @method static Builder<static>|Theme whereTypography($value)
 * @method static Builder<static>|Theme whereUpdatedAt($value)
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class Theme extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $locale_code
 * @property string $group
 * @property string $key
 * @property string $value
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Locale $locale
 * @method static Builder<static>|Translation forLocale(string $localeCode)
 * @method static Builder<static>|Translation inGroup(string $group)
 * @method static Builder<static>|Translation newModelQuery()
 * @method static Builder<static>|Translation newQuery()
 * @method static Builder<static>|Translation query()
 * @method static Builder<static>|Translation whereCreatedAt($value)
 * @method static Builder<static>|Translation whereGroup($value)
 * @method static Builder<static>|Translation whereId($value)
 * @method static Builder<static>|Translation whereKey($value)
 * @method static Builder<static>|Translation whereLocaleCode($value)
 * @method static Builder<static>|Translation whereUpdatedAt($value)
 * @method static Builder<static>|Translation whereValue($value)
 * @mixin Model
 */
	class Translation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property Carbon|null $processing_restricted_at
 * @property Customer|null $customer
 * @property string $name
 * @property string $email
 * @property CarbonImmutable|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property CarbonImmutable|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property string|null $google_id
 * @property string|null $github_id
 * @property string|null $avatar_url
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read bool $admin
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read Collection<int, Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read Collection<int, Role> $roles
 * @property-read int|null $roles_count
 * @property-read Collection<int, Permission> $teams
 * @property-read int|null $teams_count
 * @property-read Collection<int, PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static UserFactory factory($count = null, $state = [])
 * @method static Builder<static>|User newModelQuery()
 * @method static Builder<static>|User newQuery()
 * @method static Builder<static>|User onlyTrashed()
 * @method static Builder<static>|User permission($permissions, bool $without = false)
 * @method static Builder<static>|User query()
 * @method static Builder<static>|User role($roles, ?string $guard = null, bool $without = false)
 * @method static Builder<static>|User team($teams, bool $without = false)
 * @method static Builder<static>|User whereAvatarUrl($value)
 * @method static Builder<static>|User whereCreatedAt($value)
 * @method static Builder<static>|User whereDeletedAt($value)
 * @method static Builder<static>|User whereEmail($value)
 * @method static Builder<static>|User whereEmailVerifiedAt($value)
 * @method static Builder<static>|User whereGithubId($value)
 * @method static Builder<static>|User whereGoogleId($value)
 * @method static Builder<static>|User whereId($value)
 * @method static Builder<static>|User whereName($value)
 * @method static Builder<static>|User wherePassword($value)
 * @method static Builder<static>|User whereProcessingRestrictedAt($value)
 * @method static Builder<static>|User whereRememberToken($value)
 * @method static Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static Builder<static>|User whereTwoFactorSecret($value)
 * @method static Builder<static>|User whereUpdatedAt($value)
 * @method static Builder<static>|User withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|User withoutPermission($permissions)
 * @method static Builder<static>|User withoutRole($roles, ?string $guard = null)
 * @method static Builder<static>|User withoutTeam($teams)
 * @method static Builder<static>|User withoutTrashed()
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	class User extends \Eloquent implements \Illuminate\Contracts\Auth\MustVerifyEmail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $variant_id
 * @property int $attribute_id
 * @property int $attribute_value_id
 * @property-read Attribute $attribute
 * @property-read AttributeValue $attributeValue
 * @property-read ProductVariant $variant
 * @method static VariantAttributeValueFactory factory($count = null, $state = [])
 * @method static Builder<static>|VariantAttributeValue newModelQuery()
 * @method static Builder<static>|VariantAttributeValue newQuery()
 * @method static Builder<static>|VariantAttributeValue query()
 * @method static Builder<static>|VariantAttributeValue whereAttributeId($value)
 * @method static Builder<static>|VariantAttributeValue whereAttributeValueId($value)
 * @method static Builder<static>|VariantAttributeValue whereId($value)
 * @method static Builder<static>|VariantAttributeValue whereVariantId($value)
 * @mixin Model
 */
	class VariantAttributeValue extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $url
 * @property string $secret
 * @property array $events
 * @property bool $is_active
 * @property string|null $description
 * @property int $failure_count
 * @property Carbon|null $last_triggered_at
 * @property Collection<int, WebhookDelivery> $deliveries
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $deliveries_count
 * @method static WebhookFactory factory($count = null, $state = [])
 * @method static Builder<static>|Webhook newModelQuery()
 * @method static Builder<static>|Webhook newQuery()
 * @method static Builder<static>|Webhook onlyTrashed()
 * @method static Builder<static>|Webhook query()
 * @method static Builder<static>|Webhook whereCreatedAt($value)
 * @method static Builder<static>|Webhook whereDeletedAt($value)
 * @method static Builder<static>|Webhook whereDescription($value)
 * @method static Builder<static>|Webhook whereEvents($value)
 * @method static Builder<static>|Webhook whereFailureCount($value)
 * @method static Builder<static>|Webhook whereId($value)
 * @method static Builder<static>|Webhook whereIsActive($value)
 * @method static Builder<static>|Webhook whereLastTriggeredAt($value)
 * @method static Builder<static>|Webhook whereName($value)
 * @method static Builder<static>|Webhook whereSecret($value)
 * @method static Builder<static>|Webhook whereUpdatedAt($value)
 * @method static Builder<static>|Webhook whereUrl($value)
 * @method static Builder<static>|Webhook withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Webhook withoutTrashed()
 * @mixin Model
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 */
	final class Webhook extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $webhook_id
 * @property string $event
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property int $attempt
 * @property int|null $response_status
 * @property string|null $response_body
 * @property int|null $duration_ms
 * @property CarbonImmutable|null $delivered_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Webhook|null $webhook
 * @method static WebhookDeliveryFactory factory($count = null, $state = [])
 * @method static Builder<static>|WebhookDelivery newModelQuery()
 * @method static Builder<static>|WebhookDelivery newQuery()
 * @method static Builder<static>|WebhookDelivery query()
 * @method static Builder<static>|WebhookDelivery whereAttempt($value)
 * @method static Builder<static>|WebhookDelivery whereCreatedAt($value)
 * @method static Builder<static>|WebhookDelivery whereDeliveredAt($value)
 * @method static Builder<static>|WebhookDelivery whereDurationMs($value)
 * @method static Builder<static>|WebhookDelivery whereEvent($value)
 * @method static Builder<static>|WebhookDelivery whereId($value)
 * @method static Builder<static>|WebhookDelivery wherePayload($value)
 * @method static Builder<static>|WebhookDelivery whereResponseBody($value)
 * @method static Builder<static>|WebhookDelivery whereResponseStatus($value)
 * @method static Builder<static>|WebhookDelivery whereStatus($value)
 * @method static Builder<static>|WebhookDelivery whereUpdatedAt($value)
 * @method static Builder<static>|WebhookDelivery whereWebhookId($value)
 * @mixin Model
 */
	final class WebhookDelivery extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $customer_id
 * @property string|null $session_token
 * @property string $name
 * @property string|null $token
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, WishlistItem> $items
 * @property-read int|null $items_count
 * @method static Builder<static>|Wishlist newModelQuery()
 * @method static Builder<static>|Wishlist newQuery()
 * @method static Builder<static>|Wishlist query()
 * @method static Builder<static>|Wishlist whereCreatedAt($value)
 * @method static Builder<static>|Wishlist whereCustomerId($value)
 * @method static Builder<static>|Wishlist whereId($value)
 * @method static Builder<static>|Wishlist whereIsPublic($value)
 * @method static Builder<static>|Wishlist whereName($value)
 * @method static Builder<static>|Wishlist whereSessionToken($value)
 * @method static Builder<static>|Wishlist whereToken($value)
 * @method static Builder<static>|Wishlist whereUpdatedAt($value)
 * @mixin Model
 * @property-read \App\Models\Customer|null $customer
 */
	class Wishlist extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $wishlist_id
 * @property int $product_variant_id
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $variant
 * @property-read Wishlist $wishlist
 * @method static Builder<static>|WishlistItem newModelQuery()
 * @method static Builder<static>|WishlistItem newQuery()
 * @method static Builder<static>|WishlistItem query()
 * @method static Builder<static>|WishlistItem whereCreatedAt($value)
 * @method static Builder<static>|WishlistItem whereId($value)
 * @method static Builder<static>|WishlistItem whereNotes($value)
 * @method static Builder<static>|WishlistItem whereProductVariantId($value)
 * @method static Builder<static>|WishlistItem whereUpdatedAt($value)
 * @method static Builder<static>|WishlistItem whereWishlistId($value)
 * @mixin Model
 */
	class WishlistItem extends \Eloquent {}
}

