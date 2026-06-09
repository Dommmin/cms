<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\MenuLocationEnum;
use App\Enums\PageBlockTypeEnum;
use App\Enums\PageTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\TaxRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingWizardController extends Controller
{
    public function index(): Response
    {
        // Get all settings mapped by group.key
        $settings = Setting::query()->get()->mapWithKeys(function ($setting): array {
            $value = $setting->value;
            if ($setting->type->value === 'encrypted' && $value) {
                $value = '••••••••';
            }

            return [$setting->group.'.'.$setting->key => $value];
        })->toArray();

        // Get shipping methods
        $shippingMethods = ShippingMethod::query()->orderBy('id')->get()->map(fn ($m): array => [
            'id' => $m->id,
            'name' => $m->name,
            'base_price' => $m->base_price / 100, // convert to float representation
            'is_active' => $m->is_active,
            'carrier' => $m->carrier->value,
            'free_shipping_threshold' => $m->free_shipping_threshold ? ($m->free_shipping_threshold / 100) : null,
        ])->all();

        // Get tax rates
        $taxRates = TaxRate::query()->orderBy('id')->get()->toArray();

        // Get homepage hero block config
        $homePage = Page::query()->where('slug->en', 'home')->first();
        $homepageHero = null;
        if ($homePage) {
            $heroBlock = PageBlock::query()
                ->where('page_id', $homePage->id)
                ->where('type', PageBlockTypeEnum::HeroBanner)
                ->first();
            if ($heroBlock) {
                $homepageHero = $heroBlock->configuration;
            }
        }

        // Get header menu
        $menu = Menu::query()->where('location', MenuLocationEnum::Header->value)->first();
        $menuData = null;
        if ($menu) {
            $menu->load(['items' => fn ($q) => $q->with(['children' => fn ($q) => $q->orderBy('position')])]);
            $menuData = [
                'id' => $menu->id,
                'name' => $menu->name,
                'items' => $menu->items->map(fn (MenuItem $item): array => $this->serializeItem($item))->values()->all(),
            ];
        }

        // Get legal pages
        $privacyPage = Page::query()->where('system_page_key', 'privacy_policy')->first();
        $termsPage = Page::query()->where('system_page_key', 'terms_of_service')->first();

        $legalPages = [
            'privacy_policy' => $privacyPage ? [
                'id' => $privacyPage->id,
                'title' => $privacyPage->title,
                'content' => $privacyPage->content,
            ] : null,
            'terms_of_service' => $termsPage ? [
                'id' => $termsPage->id,
                'title' => $termsPage->title,
                'content' => $termsPage->content,
            ] : null,
        ];

        // Get wizard settings
        $completedSteps = Setting::get('wizard', 'completed_steps');
        if (is_string($completedSteps)) {
            $completedSteps = json_decode($completedSteps, true) ?: [];
        } elseif (! is_array($completedSteps)) {
            $completedSteps = [];
        }

        $currentStep = Setting::get('wizard', 'current_step', 'brand');
        $isCompleted = filter_var(Setting::get('wizard', 'is_completed', false), FILTER_VALIDATE_BOOLEAN);

        return Inertia::render('admin/onboarding/index', [
            'settings' => $settings,
            'shippingMethods' => $shippingMethods,
            'taxRates' => $taxRates,
            'homepageHero' => $homepageHero,
            'menu' => $menuData,
            'legalPages' => $legalPages,
            'wizard' => [
                'completed_steps' => $completedSteps,
                'current_step' => $currentStep,
                'is_completed' => $isCompleted,
            ],
        ]);
    }

    public function saveStep(Request $request, string $step): RedirectResponse
    {
        match ($step) {
            'brand' => $this->saveBrandStep($request),
            'domain' => $this->saveDomainStep($request),
            'payments' => $this->savePaymentsStep($request),
            'shipping' => $this->saveShippingStep($request),
            'taxes' => $this->saveTaxesStep($request),
            'homepage' => $this->saveHomepageStep($request),
            'menu' => $this->saveMenuStep($request),
            'seo' => $this->saveSeoStep($request),
            'legal' => $this->saveLegalStep($request),
            default => abort(404, 'Invalid step'),
        };

        // Update onboarding progress
        $completedSteps = Setting::get('wizard', 'completed_steps');
        if (is_string($completedSteps)) {
            $completedSteps = json_decode($completedSteps, true) ?: [];
        } elseif (! is_array($completedSteps)) {
            $completedSteps = [];
        }

        if (! in_array($step, $completedSteps, true)) {
            $completedSteps[] = $step;
            Setting::set('wizard', 'completed_steps', $completedSteps);
        }

        // Define next step
        $stepsList = ['brand', 'domain', 'payments', 'shipping', 'taxes', 'homepage', 'menu', 'seo', 'legal'];
        $currentIndex = array_search($step, $stepsList, true);
        if ($currentIndex !== false && $currentIndex < count($stepsList) - 1) {
            $nextStep = $stepsList[$currentIndex + 1];
            Setting::set('wizard', 'current_step', $nextStep);
        }

        return back()->with('success', 'Krok zapisany pomyślnie');
    }

    public function complete(): RedirectResponse
    {
        Setting::set('wizard', 'is_completed', true);
        Setting::set('wizard', 'current_step', 'completed');

        return to_route('admin.dashboard')->with('success', 'Gratulacje! Setup wizard został pomyślnie ukończony.');
    }

    private function serializeItem(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url ?? '',
            'target' => $item->target ?? '_self',
            'icon' => $item->icon,
            'position' => $item->position,
            'parent_id' => $item->parent_id,
            'children' => $item->children->map(fn (MenuItem $c): array => $this->serializeItem($c))->values(),
        ];
    }

    private function getOrCreateHomepageHero(): PageBlock
    {
        $homePage = Page::query()->where('slug->en', 'home')->first();
        if (! $homePage) {
            $homePage = Page::query()->create([
                'title' => ['en' => 'Home', 'pl' => 'Strona główna'],
                'slug' => ['en' => 'home', 'pl' => 'strona-glowna'],
                'page_type' => PageTypeEnum::Blocks,
                'is_published' => true,
                'published_at' => now(),
                'position' => 1,
            ]);
        }

        $section = $homePage->sections()->first();
        if (! $section) {
            /** @var PageSection $section */
            $section = PageSection::query()->create([
                'page_id' => $homePage->id,
                'name' => 'Hero Section',
                'type' => 'hero',
                'layout' => 'full-width',
                'theme' => 'light',
                'position' => 1,
                'is_active' => true,
            ]);
        }

        assert($section instanceof PageSection);

        $block = PageBlock::query()
            ->where('page_id', $homePage->id)
            ->where('type', PageBlockTypeEnum::HeroBanner)
            ->first();

        if (! $block) {
            return PageBlock::query()->create([
                'page_id' => $homePage->id,
                'section_id' => $section->id,
                'type' => PageBlockTypeEnum::HeroBanner,
                'position' => 1,
                'is_active' => true,
                'configuration' => [
                    'title' => 'Style Meets Substance',
                    'subtitle' => 'Curated essentials — crafted to last and designed to inspire.',
                    'cta_text' => 'Shop Now',
                    'cta_url' => '/products',
                    'cta_style' => 'primary',
                ],
            ]);
        }

        return $block;
    }

    private function getOrCreateLegalPage(string $key, string $slug, string $title): Page
    {
        $page = Page::query()->where('system_page_key', $key)->first();
        if (! $page) {
            return Page::query()->create([
                'title' => ['en' => $title],
                'slug' => ['en' => $slug],
                'page_type' => PageTypeEnum::Module,
                'module_name' => 'content',
                'module_config' => ['html' => sprintf('<p>Default content for %s.</p>', $title)],
                'content' => sprintf('<p>Default content for %s.</p>', $title),
                'is_published' => true,
                'published_at' => now(),
                'system_page_key' => $key,
            ]);
        }

        return $page;
    }

    private function saveBrandStep(Request $request): void
    {
        $validated = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'site_logo' => ['nullable', 'string', 'max:1000'],
            'site_favicon' => ['nullable', 'string', 'max:1000'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'contact_address' => ['nullable', 'string', 'max:500'],
        ]);

        Setting::set('general', 'site_name', $validated['site_name']);
        Setting::set('general', 'site_logo', $validated['site_logo'] ?? null);
        Setting::set('general', 'site_favicon', $validated['site_favicon'] ?? null);
        Setting::set('general', 'contact_email', $validated['contact_email']);
        Setting::set('general', 'contact_phone', $validated['contact_phone'] ?? null);
        Setting::set('general', 'contact_address', $validated['contact_address'] ?? null);
    }

    private function saveDomainStep(Request $request): void
    {
        $validated = $request->validate([
            'site_url' => ['required', 'string', 'max:255'],
            'maintenance_mode' => ['required', 'boolean'],
        ]);

        Setting::set('general', 'site_url', $validated['site_url']);
        Setting::set('general', 'maintenance_mode', $validated['maintenance_mode']);
    }

    private function savePaymentsStep(Request $request): void
    {
        $validated = $request->validate([
            'stripe_public_key' => ['nullable', 'string', 'max:255'],
            'stripe_secret_key' => ['nullable', 'string', 'max:255'],
            'payu_client_id' => ['nullable', 'string', 'max:255'],
            'payu_client_secret' => ['nullable', 'string', 'max:255'],
            'payu_pos_id' => ['nullable', 'string', 'max:255'],
            'payu_md5_key' => ['nullable', 'string', 'max:255'],
            'payu_sandbox' => ['nullable', 'boolean'],
            'p24_merchant_id' => ['nullable', 'string', 'max:255'],
            'p24_pos_id' => ['nullable', 'string', 'max:255'],
            'p24_crc' => ['nullable', 'string', 'max:255'],
            'p24_api_key' => ['nullable', 'string', 'max:255'],
            'p24_sandbox' => ['nullable', 'boolean'],
            'bank_transfer_account_name' => ['nullable', 'string', 'max:255'],
            'bank_transfer_iban' => ['nullable', 'string', 'max:255'],
            'bank_transfer_swift' => ['nullable', 'string', 'max:255'],
            'bank_transfer_bank_name' => ['nullable', 'string', 'max:255'],
        ]);

        $updateEncryptedSetting = function (string $group, string $key, ?string $val): void {
            if ($val === '••••••••') {
                return;
            }

            Setting::set($group, $key, $val);
        };

        Setting::set('integrations', 'stripe_public_key', $validated['stripe_public_key'] ?? null);
        $updateEncryptedSetting('integrations', 'stripe_secret_key', $validated['stripe_secret_key'] ?? null);

        Setting::set('payments', 'payu_client_id', $validated['payu_client_id'] ?? null);
        $updateEncryptedSetting('payments', 'payu_client_secret', $validated['payu_client_secret'] ?? null);
        Setting::set('payments', 'payu_pos_id', $validated['payu_pos_id'] ?? null);
        $updateEncryptedSetting('payments', 'payu_md5_key', $validated['payu_md5_key'] ?? null);
        Setting::set('payments', 'payu_sandbox', $validated['payu_sandbox'] ?? true);

        Setting::set('payments', 'p24_merchant_id', $validated['p24_merchant_id'] ?? null);
        Setting::set('payments', 'p24_pos_id', $validated['p24_pos_id'] ?? null);
        $updateEncryptedSetting('payments', 'p24_crc', $validated['p24_crc'] ?? null);
        $updateEncryptedSetting('payments', 'p24_api_key', $validated['p24_api_key'] ?? null);
        Setting::set('payments', 'p24_sandbox', $validated['p24_sandbox'] ?? true);

        Setting::set('payments', 'bank_transfer_account_name', $validated['bank_transfer_account_name'] ?? null);
        Setting::set('payments', 'bank_transfer_iban', $validated['bank_transfer_iban'] ?? null);
        Setting::set('payments', 'bank_transfer_swift', $validated['bank_transfer_swift'] ?? null);
        Setting::set('payments', 'bank_transfer_bank_name', $validated['bank_transfer_bank_name'] ?? null);

        cache()->forget('settings.payments');
        cache()->forget('settings.integrations');
    }

    private function saveShippingStep(Request $request): void
    {
        $validated = $request->validate([
            'free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'methods' => ['nullable', 'array'],
            'methods.*.id' => ['required', 'integer'],
            'methods.*.is_active' => ['required', 'boolean'],
            'methods.*.base_price' => ['required', 'numeric', 'min:0'],
            'methods.*.free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
        ]);

        Setting::set('ecommerce', 'free_shipping_threshold', $validated['free_shipping_threshold'] ?? null);
        Setting::set('ecommerce', 'shipping_cost', $validated['shipping_cost'] ?? null);

        foreach ($validated['methods'] ?? [] as $methodData) {
            ShippingMethod::query()
                ->where('id', $methodData['id'])
                ->update([
                    'is_active' => $methodData['is_active'],
                    'base_price' => (int) ($methodData['base_price'] * 100),
                    'free_shipping_threshold' => isset($methodData['free_shipping_threshold'])
                        ? (int) ($methodData['free_shipping_threshold'] * 100)
                        : null,
                ]);
        }
    }

    private function saveTaxesStep(Request $request): void
    {
        $validated = $request->validate([
            'tax_rate' => ['required', 'integer', 'min:0', 'max:100'],
            'rates' => ['nullable', 'array'],
            'rates.*.id' => ['nullable', 'integer'],
            'rates.*.name' => ['required', 'string', 'max:255'],
            'rates.*.rate' => ['required', 'integer', 'min:0', 'max:100'],
            'rates.*.country_code' => ['required', 'string', 'size:2'],
            'rates.*.is_active' => ['required', 'boolean'],
            'rates.*.is_default' => ['required', 'boolean'],
        ]);

        Setting::set('ecommerce', 'tax_rate', $validated['tax_rate']);

        foreach ($validated['rates'] ?? [] as $rateData) {
            $attributes = [
                'name' => $rateData['name'],
                'rate' => (int) $rateData['rate'],
                'country_code' => mb_strtoupper((string) $rateData['country_code']),
                'is_active' => $rateData['is_active'],
                'is_default' => $rateData['is_default'],
            ];

            if ($rateData['is_default']) {
                TaxRate::query()->where('is_default', true)->update(['is_default' => false]);
            }

            if (! empty($rateData['id'])) {
                TaxRate::query()->where('id', $rateData['id'])->update($attributes);
            } else {
                TaxRate::query()->create($attributes);
            }
        }
    }

    private function saveHomepageStep(Request $request): void
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'cta_text' => ['nullable', 'string', 'max:255'],
            'cta_url' => ['nullable', 'string', 'max:500'],
        ]);

        $block = $this->getOrCreateHomepageHero();
        $block->update([
            'configuration' => array_merge($block->configuration ?? [], [
                'title' => $validated['title'],
                'subtitle' => $validated['subtitle'] ?? '',
                'cta_text' => $validated['cta_text'] ?? '',
                'cta_url' => $validated['cta_url'] ?? '',
            ]),
        ]);
    }

    private function saveMenuStep(Request $request): void
    {
        $validated = $request->validate([
            'items' => ['sometimes', 'array'],
            'items.*.label' => ['required', 'array'],
            'items.*.label.*' => ['required', 'string', 'max:255'],
            'items.*.url' => ['nullable', 'string', 'max:500'],
            'items.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            'items.*.icon' => ['nullable', 'string', 'max:100'],
            'items.*.children' => ['sometimes', 'array'],
            'items.*.children.*.label' => ['required', 'array'],
            'items.*.children.*.label.*' => ['required', 'string', 'max:255'],
            'items.*.children.*.url' => ['nullable', 'string', 'max:500'],
            'items.*.children.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            'items.*.children.*.icon' => ['nullable', 'string', 'max:100'],
        ]);

        $menu = Menu::query()->where('location', MenuLocationEnum::Header->value)->first();
        if (! $menu) {
            $menu = Menu::query()->create([
                'name' => 'Header Navigation',
                'location' => MenuLocationEnum::Header,
                'is_active' => true,
            ]);
        }

        $menu->allItems()->delete();

        foreach ($validated['items'] ?? [] as $position => $itemData) {
            $this->createMenuItem($menu->id, $itemData, null, $position);
        }
    }

    private function saveSeoStep(Request $request): void
    {
        $validated = $request->validate([
            'meta_title' => ['required', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'disable_indexing' => ['required', 'boolean'],
        ]);

        Setting::set('seo', 'meta_title', $validated['meta_title']);
        Setting::set('seo', 'meta_description', $validated['meta_description'] ?? null);
        Setting::set('seo', 'disable_indexing', $validated['disable_indexing']);
    }

    private function saveLegalStep(Request $request): void
    {
        $validated = $request->validate([
            'privacy_policy_content' => ['required', 'string'],
            'terms_of_service_content' => ['required', 'string'],
        ]);

        $privacy = $this->getOrCreateLegalPage('privacy_policy', 'privacy-policy', 'Privacy Policy');
        $privacy->update([
            'content' => $validated['privacy_policy_content'],
            'module_config' => ['html' => $validated['privacy_policy_content']],
        ]);

        $terms = $this->getOrCreateLegalPage('terms_of_service', 'terms-of-service', 'Terms of Service');
        $terms->update([
            'content' => $validated['terms_of_service_content'],
            'module_config' => ['html' => $validated['terms_of_service_content']],
        ]);
    }

    private function createMenuItem(int $menuId, array $data, ?int $parentId, int $position): void
    {
        $item = MenuItem::query()->create([
            'menu_id' => $menuId,
            'parent_id' => $parentId,
            'label' => $data['label'],
            'url' => $data['url'] ?? '',
            'target' => $data['target'] ?? '_self',
            'icon' => $data['icon'] ?? null,
            'is_active' => true,
            'position' => $position,
        ]);

        foreach ($data['children'] ?? [] as $childPosition => $childData) {
            $this->createMenuItem($menuId, $childData, $item->id, $childPosition);
        }
    }
}
