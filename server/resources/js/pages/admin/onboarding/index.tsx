import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowRight,
    CheckCircle2,
    Circle,
    Coins,
    CreditCard,
    Globe,
    Layout,
    Menu as MenuIcon,
    Percent,
    Settings,
    Shield,
    Sparkles,
    Trash2,
    Truck,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import * as OnboardingWizardController from '@/actions/App/Http/Controllers/Admin/OnboardingWizardController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { OnboardingProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Setup Wizard', href: '/panel/onboarding' },
];

export default function Onboarding({
    settings,
    shippingMethods,
    taxRates,
    homepageHero,
    menu,
    legalPages,
    wizard,
}: OnboardingProps) {
    const __ = useTranslation();
    const [activeStep, setActiveStep] = useState<string>(
        wizard.current_step || 'brand',
    );
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    // Initial state setup for step forms
    const forms = {
        brand: useForm({
            site_name: settings['general.site_name'] || '',
            site_logo: settings['general.site_logo'] || '',
            site_favicon: settings['general.site_favicon'] || '',
            contact_email: settings['general.contact_email'] || '',
            contact_phone: settings['general.contact_phone'] || '',
            contact_address: settings['general.contact_address'] || '',
        }),
        domain: useForm({
            site_url: settings['general.site_url'] || window.location.origin,
            maintenance_mode:
                settings['general.maintenance_mode'] === 'true' ||
                settings['general.maintenance_mode'] === true,
        }),
        payments: useForm({
            stripe_public_key: settings['payments.stripe_public_key'] || '',
            stripe_secret_key: settings['payments.stripe_secret_key'] || '',
            stripe_webhook_secret:
                settings['payments.stripe_webhook_secret'] || '',
            payu_client_id: settings['payments.payu_client_id'] || '',
            payu_client_secret: settings['payments.payu_client_secret'] || '',
            payu_pos_id: settings['payments.payu_pos_id'] || '',
            payu_md5_key: settings['payments.payu_md5_key'] || '',
            payu_sandbox:
                settings['payments.payu_sandbox'] === 'true' ||
                settings['payments.payu_sandbox'] === true,
            p24_merchant_id: settings['payments.p24_merchant_id'] || '',
            p24_pos_id: settings['payments.p24_pos_id'] || '',
            p24_crc: settings['payments.p24_crc'] || '',
            p24_api_key: settings['payments.p24_api_key'] || '',
            p24_sandbox:
                settings['payments.p24_sandbox'] === 'true' ||
                settings['payments.p24_sandbox'] === true,
            bank_transfer_account_name:
                settings['payments.bank_transfer_account_name'] || '',
            bank_transfer_iban: settings['payments.bank_transfer_iban'] || '',
            bank_transfer_swift: settings['payments.bank_transfer_swift'] || '',
            bank_transfer_bank_name:
                settings['payments.bank_transfer_bank_name'] || '',
        }),
        shipping: useForm({
            free_shipping_threshold:
                settings['ecommerce.free_shipping_threshold'] || '0',
            shipping_cost: settings['ecommerce.shipping_cost'] || '0',
            methods: shippingMethods,
        }),
        taxes: useForm({
            tax_rate: settings['ecommerce.tax_rate'] || 23,
            rates: taxRates,
        }),
        homepage: useForm({
            title: homepageHero?.title || 'Style Meets Substance',
            subtitle:
                homepageHero?.subtitle ||
                'Curated essentials for your daily routine.',
            cta_text: homepageHero?.cta_text || 'Shop Now',
            cta_url: homepageHero?.cta_url || '/products',
        }),
        menu: useForm({
            items: menu?.items || [],
        }),
        seo: useForm({
            meta_title: settings['seo.meta_title'] || '',
            meta_description: settings['seo.meta_description'] || '',
            disable_indexing:
                settings['seo.disable_indexing'] === 'true' ||
                settings['seo.disable_indexing'] === true,
        }),
        legal: useForm({
            privacy_policy_content: legalPages.privacy_policy?.content || '',
            terms_of_service_content:
                legalPages.terms_of_service?.content || '',
        }),
    };

    const steps = [
        {
            id: 'brand',
            label: __('onboarding.step.brand', 'Marka i podstawy'),
            icon: Settings,
            desc: 'Nazwa, logo, kontakt',
        },
        {
            id: 'domain',
            label: __('onboarding.step.domain', 'Domena i status'),
            icon: Globe,
            desc: 'URL i tryb konserwacji',
        },
        {
            id: 'payments',
            label: __('onboarding.step.payments', 'Płatności'),
            icon: CreditCard,
            desc: 'Stripe, PayU, P24, Bank',
        },
        {
            id: 'shipping',
            label: __('onboarding.step.shipping', 'Dostawy'),
            icon: Truck,
            desc: 'Koszty i metody dostaw',
        },
        {
            id: 'taxes',
            label: __('onboarding.step.taxes', 'Podatki i VAT'),
            icon: Percent,
            desc: 'Stawki i kraje',
        },
        {
            id: 'homepage',
            label: __('onboarding.step.homepage', 'Strona główna'),
            icon: Layout,
            desc: 'Hero banner i teksty',
        },
        {
            id: 'menu',
            label: __('onboarding.step.menu', 'Menu nawigacyjne'),
            icon: MenuIcon,
            desc: 'Linki w nagłówku',
        },
        {
            id: 'seo',
            label: __('onboarding.step.seo', 'SEO podstawy'),
            icon: Sparkles,
            desc: 'Tytuł, opis, indeksowanie',
        },
        {
            id: 'legal',
            label: __('onboarding.step.legal', 'Polityki prawne'),
            icon: Shield,
            desc: 'Regulamin i prywatność',
        },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
    const completedCount = steps.filter((s) =>
        wizard.completed_steps.includes(s.id),
    ).length;
    const progressPercent = Math.round((completedCount / steps.length) * 100);

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'site_logo' | 'site_favicon',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isLogo = field === 'site_logo';
        if (isLogo) setUploadingLogo(true);
        else setUploadingFavicon(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection', 'settings');

        try {
            const res = await axios.post(
                MediaController.upload.url(),
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );
            const uploadedFile = res.data[0];
            if (uploadedFile && uploadedFile.url) {
                forms.brand.setData(field, uploadedFile.url);
                toast.success(
                    __('onboarding.upload_success', 'Plik przesłany pomyślnie'),
                );
            }
        } catch {
            toast.error(
                __(
                    'onboarding.upload_error',
                    'Wystąpił błąd podczas przesłania pliku.',
                ),
            );
        } finally {
            if (isLogo) setUploadingLogo(false);
            else setUploadingFavicon(false);
        }
    };

    const submitStep = (stepId: keyof typeof forms) => {
        const form = forms[stepId];
        form.post(OnboardingWizardController.saveStep.url(stepId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    __('onboarding.step_saved', 'Krok zapisany pomyślnie'),
                );
                // Advance to next step locally if one exists
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length) {
                    setActiveStep(steps[nextIndex].id);
                } else {
                    toast.success(
                        __(
                            'onboarding.all_done_msg',
                            'Wszystkie kroki ukończone! Kliknij przycisk poniżej, aby zakończyć.',
                        ),
                    );
                }
            },
            onError: () => {
                toast.error(
                    __(
                        'onboarding.save_error',
                        'Wystąpił błąd podczas zapisu kroku.',
                    ),
                );
            },
        });
    };

    const completeOnboarding = () => {
        router.post(
            OnboardingWizardController.complete.url(),
            {},
            {
                onSuccess: () => {
                    toast.success(
                        __(
                            'onboarding.completed_success',
                            'Setup wizard został pomyślnie ukończony!',
                        ),
                    );
                },
            },
        );
    };

    // Sub-item renderer helper for menu builder
    const addMenuItem = () => {
        const items = [...forms.menu.data.items];
        items.push({
            label: { en: 'New Link', pl: 'Nowy link' },
            url: '/',
            target: '_self',
            position: items.length,
            children: [],
        });
        forms.menu.setData('items', items);
    };

    const removeMenuItem = (index: number) => {
        const items = [...forms.menu.data.items];
        items.splice(index, 1);
        forms.menu.setData('items', items);
    };

    const addTaxRate = () => {
        const rates = [...forms.taxes.data.rates];
        rates.push({
            name: 'New VAT Rate',
            rate: 23,
            country_code: 'PL',
            is_active: true,
            is_default: false,
        });
        forms.taxes.setData('rates', rates);
    };

    const removeTaxRate = (index: number) => {
        const rates = [...forms.taxes.data.rates];
        rates.splice(index, 1);
        forms.taxes.setData('rates', rates);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Setup Wizard" />

            <Wrapper>
                <div className="mb-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 shadow-sm backdrop-blur-md dark:border-blue-500/30">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <Sparkles className="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-foreground">
                                    {__(
                                        'onboarding.header.title',
                                        'Setup Wizard',
                                    )}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'onboarding.header.subtitle',
                                        'Skonfiguruj podstawowe ustawienia swojego nowego sklepu w kilku krokach.',
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-[200px] flex-col gap-2">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span>
                                    {progressPercent}%{' '}
                                    {__(
                                        'onboarding.progress.completed',
                                        'ukończone',
                                    )}
                                </span>
                                <span className="text-muted-foreground">
                                    {completedCount}/{steps.length}{' '}
                                    {__('onboarding.progress.steps', 'kroków')}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Stepper Sidebar */}
                    <Card className="border border-border/40 bg-card/60 p-4 backdrop-blur-sm lg:col-span-1">
                        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
                            {steps.map((step) => {
                                const isCurrent = step.id === activeStep;
                                const isCompleted =
                                    wizard.completed_steps.includes(step.id);
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(step.id)}
                                        className={`flex min-w-[14rem] flex-1 shrink-0 items-start gap-3 rounded-xl p-3 text-left transition-all duration-200 lg:w-full lg:min-w-0 lg:flex-none ${
                                            isCurrent
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                        aria-current={
                                            isCurrent ? 'step' : undefined
                                        }
                                    >
                                        <span className="mt-0.5 shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2
                                                    className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-green-500'}`}
                                                />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <p
                                                className={`text-sm leading-tight font-semibold ${isCurrent ? 'text-white' : 'text-foreground'}`}
                                            >
                                                {step.label}
                                            </p>
                                            <p
                                                className={`mt-0.5 line-clamp-2 text-xs ${isCurrent ? 'text-blue-100' : 'text-muted-foreground'}`}
                                            >
                                                {step.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-6 border-t border-border/40 pt-4">
                            <Button
                                onClick={completeOnboarding}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/10 hover:from-green-600 hover:to-emerald-700"
                                disabled={completedCount < steps.length}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {__(
                                    'onboarding.action.finish',
                                    'Ukończ konfigurację',
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Step Form Area */}
                    <Card className="border border-border/40 bg-card/60 p-6 shadow-xl backdrop-blur-sm lg:col-span-3">
                        {/* Step 1: Brand basics */}
                        {activeStep === 'brand' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('brand');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.brand.title',
                                            'Marka i podstawy sklepu',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.brand.desc',
                                            'Skonfiguruj podstawowe elementy wizerunkowe i dane kontaktowe.',
                                        )}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="site_name">
                                            {__(
                                                'onboarding.brand.site_name',
                                                'Nazwa sklepu',
                                            )}
                                        </Label>
                                        <Input
                                            id="site_name"
                                            value={forms.brand.data.site_name}
                                            onChange={(e) =>
                                                forms.brand.setData(
                                                    'site_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact_email">
                                            {__(
                                                'onboarding.brand.contact_email',
                                                'Adres e-mail kontaktu',
                                            )}
                                        </Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={
                                                forms.brand.data.contact_email
                                            }
                                            onChange={(e) =>
                                                forms.brand.setData(
                                                    'contact_email',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact_phone">
                                            {__(
                                                'onboarding.brand.contact_phone',
                                                'Numer telefonu',
                                            )}
                                        </Label>
                                        <Input
                                            id="contact_phone"
                                            value={
                                                forms.brand.data.contact_phone
                                            }
                                            onChange={(e) =>
                                                forms.brand.setData(
                                                    'contact_phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact_address">
                                            {__(
                                                'onboarding.brand.contact_address',
                                                'Adres rejestrowy / biuro',
                                            )}
                                        </Label>
                                        <Input
                                            id="contact_address"
                                            value={
                                                forms.brand.data.contact_address
                                            }
                                            onChange={(e) =>
                                                forms.brand.setData(
                                                    'contact_address',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 pt-2 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>
                                            {__(
                                                'onboarding.brand.site_logo',
                                                'Logo sklepu',
                                            )}
                                        </Label>
                                        <div className="flex items-center gap-4 rounded-xl border border-dashed p-4">
                                            {forms.brand.data.site_logo ? (
                                                <img
                                                    src={
                                                        forms.brand.data
                                                            .site_logo
                                                    }
                                                    alt="Logo preview"
                                                    className="h-16 w-16 rounded-lg border bg-muted object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                                                    {__(
                                                        'onboarding.no_image',
                                                        'Brak logo',
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-1.5">
                                                <Input
                                                    id="logo_file"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileUpload(
                                                            e,
                                                            'site_logo',
                                                        )
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                'logo_file',
                                                            )
                                                            ?.click()
                                                    }
                                                    disabled={uploadingLogo}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {uploadingLogo
                                                        ? __(
                                                              'onboarding.uploading',
                                                              'Przesyłanie...',
                                                          )
                                                        : __(
                                                              'onboarding.choose_file',
                                                              'Wybierz plik',
                                                          )}
                                                </Button>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {__(
                                                        'onboarding.logo_hint',
                                                        'Sugerowany format SVG lub PNG, tło przezroczyste.',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            {__(
                                                'onboarding.brand.site_favicon',
                                                'Favicon (ikonka karty)',
                                            )}
                                        </Label>
                                        <div className="flex items-center gap-4 rounded-xl border border-dashed p-4">
                                            {forms.brand.data.site_favicon ? (
                                                <img
                                                    src={
                                                        forms.brand.data
                                                            .site_favicon
                                                    }
                                                    alt="Favicon preview"
                                                    className="h-12 w-12 rounded border bg-muted object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
                                                    Fav
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-1.5">
                                                <Input
                                                    id="favicon_file"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileUpload(
                                                            e,
                                                            'site_favicon',
                                                        )
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                'favicon_file',
                                                            )
                                                            ?.click()
                                                    }
                                                    disabled={uploadingFavicon}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {uploadingFavicon
                                                        ? __(
                                                              'onboarding.uploading',
                                                              'Przesyłanie...',
                                                          )
                                                        : __(
                                                              'onboarding.choose_file',
                                                              'Wybierz plik',
                                                          )}
                                                </Button>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {__(
                                                        'onboarding.favicon_hint',
                                                        'Sugerowany format PNG, 32x32 lub ICO.',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.brand.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 2: Domain and status */}
                        {activeStep === 'domain' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('domain');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.domain.title',
                                            'Domena i ustawienia widoczności',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.domain.desc',
                                            'Skonfiguruj adres url sklepu oraz to, czy jest on dostępny dla klientów.',
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="max-w-lg space-y-1.5">
                                        <Label htmlFor="site_url">
                                            {__(
                                                'onboarding.domain.site_url',
                                                'Publiczny adres URL sklepu',
                                            )}
                                        </Label>
                                        <Input
                                            id="site_url"
                                            value={forms.domain.data.site_url}
                                            onChange={(e) =>
                                                forms.domain.setData(
                                                    'site_url',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            placeholder="https://twojsklep.pl"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'onboarding.domain.url_hint',
                                                'Główny adres URL pod którym klienci będą widzieć sklep (bez znaku / na końcu).',
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex max-w-lg items-center justify-between rounded-xl border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="maintenance_mode">
                                                {__(
                                                    'onboarding.domain.maintenance_mode',
                                                    'Tryb konserwacji',
                                                )}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {__(
                                                    'onboarding.domain.maintenance_hint',
                                                    'Wyłącz sklep dla klientów, jeśli wciąż wprowadzasz zmiany.',
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            id="maintenance_mode"
                                            checked={
                                                forms.domain.data
                                                    .maintenance_mode
                                            }
                                            onCheckedChange={(val) =>
                                                forms.domain.setData(
                                                    'maintenance_mode',
                                                    val,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.domain.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Payments */}
                        {activeStep === 'payments' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('payments');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.payments.title',
                                            'Bramki płatności',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.payments.desc',
                                            'Skonfiguruj integracje z operatorami płatności Stripe, PayU, Przelewy24 lub przelewem tradycyjnym.',
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Traditional transfer */}
                                    <div className="space-y-3 rounded-xl border bg-muted/10 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <Coins className="h-4 w-4 text-amber-500" />
                                            {__(
                                                'onboarding.payments.bank_transfer',
                                                'Przelew tradycyjny',
                                            )}
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="bank_transfer_account_name"
                                                    className="text-xs"
                                                >
                                                    {__(
                                                        'onboarding.payments.account_name',
                                                        'Nazwa odbiorcy',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="bank_transfer_account_name"
                                                    value={
                                                        forms.payments.data
                                                            .bank_transfer_account_name
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'bank_transfer_account_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="bank_transfer_bank_name"
                                                    className="text-xs"
                                                >
                                                    {__(
                                                        'onboarding.payments.bank_name',
                                                        'Nazwa banku',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="bank_transfer_bank_name"
                                                    value={
                                                        forms.payments.data
                                                            .bank_transfer_bank_name
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'bank_transfer_bank_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="bank_transfer_iban"
                                                    className="text-xs"
                                                >
                                                    IBAN / Numer konta
                                                </Label>
                                                <Input
                                                    id="bank_transfer_iban"
                                                    value={
                                                        forms.payments.data
                                                            .bank_transfer_iban
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'bank_transfer_iban',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="bank_transfer_swift"
                                                    className="text-xs"
                                                >
                                                    SWIFT / BIC
                                                </Label>
                                                <Input
                                                    id="bank_transfer_swift"
                                                    value={
                                                        forms.payments.data
                                                            .bank_transfer_swift
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'bank_transfer_swift',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stripe */}
                                    <div className="space-y-3 rounded-xl border bg-muted/10 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <CreditCard className="h-4 w-4 text-indigo-500" />
                                            Stripe Płatności
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="stripe_public_key"
                                                    className="text-xs"
                                                >
                                                    Publishable Key
                                                </Label>
                                                <Input
                                                    id="stripe_public_key"
                                                    value={
                                                        forms.payments.data
                                                            .stripe_public_key
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'stripe_public_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="pk_live_..."
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="stripe_secret_key"
                                                    className="text-xs"
                                                >
                                                    Secret Key
                                                </Label>
                                                <Input
                                                    id="stripe_secret_key"
                                                    type="password"
                                                    value={
                                                        forms.payments.data
                                                            .stripe_secret_key
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'stripe_secret_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        forms.payments.data
                                                            .stripe_secret_key
                                                            ? '••••••••'
                                                            : 'sk_live_...'
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1 sm:col-span-2">
                                                <Label
                                                    htmlFor="stripe_webhook_secret"
                                                    className="text-xs"
                                                >
                                                    Webhook Signing Secret
                                                </Label>
                                                <Input
                                                    id="stripe_webhook_secret"
                                                    type="password"
                                                    value={
                                                        forms.payments.data
                                                            .stripe_webhook_secret
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'stripe_webhook_secret',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        forms.payments.data
                                                            .stripe_webhook_secret
                                                            ? '••••••••'
                                                            : 'whsec_...'
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PayU */}
                                    <div className="space-y-3 rounded-xl border bg-muted/10 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold">
                                                <CreditCard className="h-4 w-4 text-blue-500" />
                                                PayU
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Tryb testowy (Sandbox)
                                                </span>
                                                <Switch
                                                    checked={
                                                        forms.payments.data
                                                            .payu_sandbox
                                                    }
                                                    onCheckedChange={(val) =>
                                                        forms.payments.setData(
                                                            'payu_sandbox',
                                                            val,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="payu_pos_id"
                                                    className="text-xs"
                                                >
                                                    POS ID
                                                </Label>
                                                <Input
                                                    id="payu_pos_id"
                                                    value={
                                                        forms.payments.data
                                                            .payu_pos_id
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'payu_pos_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="payu_client_id"
                                                    className="text-xs"
                                                >
                                                    Client ID
                                                </Label>
                                                <Input
                                                    id="payu_client_id"
                                                    value={
                                                        forms.payments.data
                                                            .payu_client_id
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'payu_client_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="payu_client_secret"
                                                    className="text-xs"
                                                >
                                                    Client Secret
                                                </Label>
                                                <Input
                                                    id="payu_client_secret"
                                                    type="password"
                                                    value={
                                                        forms.payments.data
                                                            .payu_client_secret
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'payu_client_secret',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        forms.payments.data
                                                            .payu_client_secret
                                                            ? '••••••••'
                                                            : ''
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="payu_md5_key"
                                                    className="text-xs"
                                                >
                                                    MD5 Key
                                                </Label>
                                                <Input
                                                    id="payu_md5_key"
                                                    type="password"
                                                    value={
                                                        forms.payments.data
                                                            .payu_md5_key
                                                    }
                                                    onChange={(e) =>
                                                        forms.payments.setData(
                                                            'payu_md5_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        forms.payments.data
                                                            .payu_md5_key
                                                            ? '••••••••'
                                                            : ''
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.payments.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 4: Shipping */}
                        {activeStep === 'shipping' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('shipping');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.shipping.title',
                                            'Metody i koszty dostaw',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.shipping.desc',
                                            'Skonfiguruj globalny darmowy próg dostawy oraz włącz lub wyłącz poszczególne metody dostaw.',
                                        )}
                                    </p>
                                </div>

                                <div className="mb-6 grid max-w-lg gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="shipping_cost">
                                            {__(
                                                'onboarding.shipping.default_cost',
                                                'Domyślny koszt wysyłki (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="shipping_cost"
                                            type="number"
                                            step="0.01"
                                            value={
                                                forms.shipping.data
                                                    .shipping_cost
                                            }
                                            onChange={(e) =>
                                                forms.shipping.setData(
                                                    'shipping_cost',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="free_shipping_threshold">
                                            {__(
                                                'onboarding.shipping.threshold',
                                                'Darmowa dostawa od (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="free_shipping_threshold"
                                            type="number"
                                            step="0.01"
                                            value={
                                                forms.shipping.data
                                                    .free_shipping_threshold
                                            }
                                            onChange={(e) =>
                                                forms.shipping.setData(
                                                    'free_shipping_threshold',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="font-semibold">
                                        {__(
                                            'onboarding.shipping.methods_list',
                                            'Dostępne metody dostaw w bazie',
                                        )}
                                    </Label>
                                    {forms.shipping.data.methods.length ===
                                    0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            {__(
                                                'onboarding.shipping.none',
                                                'Brak metod dostaw w bazie. Możesz je dodać w panelu E-commerce -> Dostawy.',
                                            )}
                                        </p>
                                    ) : (
                                        <div className="divide-y rounded-xl border">
                                            {forms.shipping.data.methods.map(
                                                (method, index) => (
                                                    <div
                                                        key={method.id}
                                                        className="flex flex-wrap items-center justify-between gap-4 p-4"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold">
                                                                {method.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Carrier:{' '}
                                                                {method.carrier ||
                                                                    'Brak'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs text-muted-foreground">
                                                                    Koszt (PLN)
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={
                                                                        method.base_price
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const methods =
                                                                            [
                                                                                ...forms
                                                                                    .shipping
                                                                                    .data
                                                                                    .methods,
                                                                            ];
                                                                        methods[
                                                                            index
                                                                        ].base_price =
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0;
                                                                        forms.shipping.setData(
                                                                            'methods',
                                                                            methods,
                                                                        );
                                                                    }}
                                                                    className="h-8 w-20 text-sm"
                                                                />
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    method.is_active
                                                                }
                                                                onCheckedChange={(
                                                                    val,
                                                                ) => {
                                                                    const methods =
                                                                        [
                                                                            ...forms
                                                                                .shipping
                                                                                .data
                                                                                .methods,
                                                                        ];
                                                                    methods[
                                                                        index
                                                                    ].is_active =
                                                                        val;
                                                                    forms.shipping.setData(
                                                                        'methods',
                                                                        methods,
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.shipping.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 5: Taxes */}
                        {activeStep === 'taxes' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('taxes');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.taxes.title',
                                            'Podatki i VAT',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.taxes.desc',
                                            'Skonfiguruj domyślny podatek VAT w sklepie oraz strefy podatkowe dla krajów.',
                                        )}
                                    </p>
                                </div>

                                <div className="mb-6 max-w-xs space-y-1.5">
                                    <Label htmlFor="tax_rate">
                                        {__(
                                            'onboarding.taxes.default_rate',
                                            'Domyślna stawka VAT (%)',
                                        )}
                                    </Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        value={forms.taxes.data.tax_rate}
                                        onChange={(e) =>
                                            forms.taxes.setData(
                                                'tax_rate',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-semibold">
                                            {__(
                                                'onboarding.taxes.rates_list',
                                                'Lista stref podatkowych',
                                            )}
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTaxRate}
                                        >
                                            +{' '}
                                            {__(
                                                'onboarding.taxes.add_rate',
                                                'Dodaj stawkę',
                                            )}
                                        </Button>
                                    </div>

                                    <div className="divide-y rounded-xl border">
                                        {forms.taxes.data.rates.map(
                                            (rate, index) => (
                                                <div
                                                    key={index}
                                                    className="grid items-end gap-3 p-4 sm:grid-cols-5"
                                                >
                                                    <div className="col-span-2 space-y-1">
                                                        <Label className="text-xs">
                                                            Nazwa stawki
                                                        </Label>
                                                        <Input
                                                            value={rate.name}
                                                            onChange={(e) => {
                                                                const rates = [
                                                                    ...forms
                                                                        .taxes
                                                                        .data
                                                                        .rates,
                                                                ];
                                                                rates[
                                                                    index
                                                                ].name =
                                                                    e.target.value;
                                                                forms.taxes.setData(
                                                                    'rates',
                                                                    rates,
                                                                );
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">
                                                            Stawka (%)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={rate.rate}
                                                            onChange={(e) => {
                                                                const rates = [
                                                                    ...forms
                                                                        .taxes
                                                                        .data
                                                                        .rates,
                                                                ];
                                                                rates[
                                                                    index
                                                                ].rate =
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0;
                                                                forms.taxes.setData(
                                                                    'rates',
                                                                    rates,
                                                                );
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">
                                                            Kod kraju (np. PL)
                                                        </Label>
                                                        <Input
                                                            value={
                                                                rate.country_code
                                                            }
                                                            onChange={(e) => {
                                                                const rates = [
                                                                    ...forms
                                                                        .taxes
                                                                        .data
                                                                        .rates,
                                                                ];
                                                                rates[
                                                                    index
                                                                ].country_code =
                                                                    e.target.value;
                                                                forms.taxes.setData(
                                                                    'rates',
                                                                    rates,
                                                                );
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2 pb-2 sm:justify-end">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-muted-foreground">
                                                                Default
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    rate.is_default
                                                                }
                                                                onChange={() => {
                                                                    const rates =
                                                                        forms.taxes.data.rates.map(
                                                                            (
                                                                                r,
                                                                                ri,
                                                                            ) => ({
                                                                                ...r,
                                                                                is_default:
                                                                                    ri ===
                                                                                    index,
                                                                            }),
                                                                        );
                                                                    forms.taxes.setData(
                                                                        'rates',
                                                                        rates,
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeTaxRate(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.taxes.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 6: Homepage Hero customization */}
                        {activeStep === 'homepage' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('homepage');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.homepage.title',
                                            'Konfiguracja strony głównej',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.homepage.desc',
                                            'Dostosuj banner powitalny (hero banner) na swojej stronie głównej.',
                                        )}
                                    </p>
                                </div>

                                <div className="max-w-lg space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero_title">
                                            {__(
                                                'onboarding.homepage.hero_title',
                                                'Główny nagłówek banneru',
                                            )}
                                        </Label>
                                        <Input
                                            id="hero_title"
                                            value={forms.homepage.data.title}
                                            onChange={(e) =>
                                                forms.homepage.setData(
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero_subtitle">
                                            {__(
                                                'onboarding.homepage.hero_subtitle',
                                                'Podtytuł banneru',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="hero_subtitle"
                                            value={forms.homepage.data.subtitle}
                                            onChange={(e) =>
                                                forms.homepage.setData(
                                                    'subtitle',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="hero_cta_text">
                                                {__(
                                                    'onboarding.homepage.cta_text',
                                                    'Tekst przycisku (CTA)',
                                                )}
                                            </Label>
                                            <Input
                                                id="hero_cta_text"
                                                value={
                                                    forms.homepage.data.cta_text
                                                }
                                                onChange={(e) =>
                                                    forms.homepage.setData(
                                                        'cta_text',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="hero_cta_url">
                                                {__(
                                                    'onboarding.homepage.cta_url',
                                                    'Link przycisku (CTA)',
                                                )}
                                            </Label>
                                            <Input
                                                id="hero_cta_url"
                                                value={
                                                    forms.homepage.data.cta_url
                                                }
                                                onChange={(e) =>
                                                    forms.homepage.setData(
                                                        'cta_url',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.homepage.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 7: Navigation menu builder */}
                        {activeStep === 'menu' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('menu');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.menu.title',
                                            'Nawigacja w nagłówku',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.menu.desc',
                                            'Stwórz główne linki nawigacyjne widoczne u góry strony dla swoich klientów.',
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-semibold">
                                            {__(
                                                'onboarding.menu.links',
                                                'Linki w menu',
                                            )}
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addMenuItem}
                                        >
                                            +{' '}
                                            {__(
                                                'onboarding.menu.add_link',
                                                'Dodaj link',
                                            )}
                                        </Button>
                                    </div>

                                    {forms.menu.data.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            {__(
                                                'onboarding.menu.none',
                                                'Brak dodanych linków w menu. Dodaj pierwszy link.',
                                            )}
                                        </p>
                                    ) : (
                                        <div className="divide-y rounded-xl border">
                                            {forms.menu.data.items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid items-end gap-3 p-4 sm:grid-cols-4"
                                                    >
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">
                                                                Etykieta (PL)
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    item.label
                                                                        .pl ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const items =
                                                                        [
                                                                            ...forms
                                                                                .menu
                                                                                .data
                                                                                .items,
                                                                        ];
                                                                    items[
                                                                        index
                                                                    ].label = {
                                                                        ...items[
                                                                            index
                                                                        ].label,
                                                                        pl: e
                                                                            .target
                                                                            .value,
                                                                    };
                                                                    forms.menu.setData(
                                                                        'items',
                                                                        items,
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">
                                                                Etykieta (EN)
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    item.label
                                                                        .en ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const items =
                                                                        [
                                                                            ...forms
                                                                                .menu
                                                                                .data
                                                                                .items,
                                                                        ];
                                                                    items[
                                                                        index
                                                                    ].label = {
                                                                        ...items[
                                                                            index
                                                                        ].label,
                                                                        en: e
                                                                            .target
                                                                            .value,
                                                                    };
                                                                    forms.menu.setData(
                                                                        'items',
                                                                        items,
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">
                                                                URL / Ścieżka
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    item.url ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const items =
                                                                        [
                                                                            ...forms
                                                                                .menu
                                                                                .data
                                                                                .items,
                                                                        ];
                                                                    items[
                                                                        index
                                                                    ].url =
                                                                        e.target.value;
                                                                    forms.menu.setData(
                                                                        'items',
                                                                        items,
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2 pb-1 sm:justify-end">
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="block text-[10px]">
                                                                    Cel (Target)
                                                                </Label>
                                                                <select
                                                                    value={
                                                                        item.target ||
                                                                        '_self'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const items =
                                                                            [
                                                                                ...forms
                                                                                    .menu
                                                                                    .data
                                                                                    .items,
                                                                            ];
                                                                        items[
                                                                            index
                                                                        ].target =
                                                                            e.target.value;
                                                                        forms.menu.setData(
                                                                            'items',
                                                                            items,
                                                                        );
                                                                    }}
                                                                    className="w-full rounded-md border p-1 text-xs"
                                                                >
                                                                    <option value="_self">
                                                                        Bieżąca
                                                                        karta
                                                                    </option>
                                                                    <option value="_blank">
                                                                        Nowa
                                                                        karta
                                                                    </option>
                                                                </select>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeMenuItem(
                                                                        index,
                                                                    )
                                                                }
                                                                className="text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.menu.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 8: SEO Basics */}
                        {activeStep === 'seo' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('seo');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.seo.title',
                                            'Ustawienia SEO',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.seo.desc',
                                            'Skonfiguruj domyślne tagi meta w celach optymalizacji wyszukiwarki Google.',
                                        )}
                                    </p>
                                </div>

                                <div className="max-w-lg space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="meta_title">
                                            {__(
                                                'onboarding.seo.meta_title',
                                                'Domyślny tytuł strony (Meta Title)',
                                            )}
                                        </Label>
                                        <Input
                                            id="meta_title"
                                            value={forms.seo.data.meta_title}
                                            onChange={(e) =>
                                                forms.seo.setData(
                                                    'meta_title',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'onboarding.seo.title_hint',
                                                'Domyślna nazwa sklepu w wynikach wyszukiwania (około 50-60 znaków).',
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="meta_description">
                                            {__(
                                                'onboarding.seo.meta_desc',
                                                'Domyślny opis strony (Meta Description)',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="meta_description"
                                            value={
                                                forms.seo.data.meta_description
                                            }
                                            onChange={(e) =>
                                                forms.seo.setData(
                                                    'meta_description',
                                                    e.target.value,
                                                )
                                            }
                                            rows={4}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'onboarding.seo.desc_hint',
                                                'Krótkie streszczenie zawartości sklepu wyświetlane w wynikach wyszukiwania (maksymalnie 160 znaków).',
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="disable_indexing">
                                                {__(
                                                    'onboarding.seo.disable_indexing',
                                                    'Zablokuj indeksowanie przez roboty',
                                                )}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {__(
                                                    'onboarding.seo.noindex_hint',
                                                    'Dodaje tag noindex, zapobiegając indeksacji w wyszukiwarce Google podczas prac wdrożeniowych.',
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            id="disable_indexing"
                                            checked={
                                                forms.seo.data.disable_indexing
                                            }
                                            onCheckedChange={(val) =>
                                                forms.seo.setData(
                                                    'disable_indexing',
                                                    val,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={forms.seo.processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {__(
                                            'onboarding.action.save_next',
                                            'Zapisz i przejdź dalej',
                                        )}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 9: Legal policy documents */}
                        {activeStep === 'legal' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep('legal');
                                }}
                                className="space-y-6"
                            >
                                <div className="mb-4 border-b border-border/60 pb-4">
                                    <h2 className="text-lg font-bold">
                                        {__(
                                            'onboarding.legal.title',
                                            'Polityki prawne i dokumenty',
                                        )}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'onboarding.legal.desc',
                                            'Wprowadź treść Polityki Prywatności oraz Regulaminu Sklepu, które są niezbędne do prowadzenia sprzedaży.',
                                        )}
                                    </p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="privacy_policy_content">
                                            {__(
                                                'onboarding.legal.privacy_policy',
                                                'Polityka prywatności (HTML)',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="privacy_policy_content"
                                            value={
                                                forms.legal.data
                                                    .privacy_policy_content
                                            }
                                            onChange={(e) =>
                                                forms.legal.setData(
                                                    'privacy_policy_content',
                                                    e.target.value,
                                                )
                                            }
                                            rows={14}
                                            className="font-mono text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="terms_of_service_content">
                                            {__(
                                                'onboarding.legal.terms',
                                                'Regulamin sklepu (HTML)',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="terms_of_service_content"
                                            value={
                                                forms.legal.data
                                                    .terms_of_service_content
                                            }
                                            onChange={(e) =>
                                                forms.legal.setData(
                                                    'terms_of_service_content',
                                                    e.target.value,
                                                )
                                            }
                                            rows={14}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        {__(
                                            'onboarding.legal.complete_hint',
                                            'Po zapisaniu obu polityk, możesz kliknąć przycisk "Zakończ konfigurację" w panelu bocznym.',
                                        )}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={forms.legal.processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {__(
                                                'onboarding.action.save_only',
                                                'Zapisz polityki',
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={completeOnboarding}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                        >
                                            {__(
                                                'onboarding.action.finish',
                                                'Zakończ setup',
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
