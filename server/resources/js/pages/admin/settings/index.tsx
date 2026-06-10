import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ChevronDown,
    CreditCardIcon,
    GlobeIcon,
    MailIcon,
    SearchIcon,
    SendIcon,
    SettingsIcon,
    ShareIcon,
    ShoppingBagIcon,
    TruckIcon,
    ZapIcon,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as SettingsController from '@/actions/App/Http/Controllers/Admin/SettingsController';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, Setting } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: SettingsController.index.url() },
];

const GROUP_ICONS: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    general: SettingsIcon,
    mail: MailIcon,
    seo: GlobeIcon,
    social: ShareIcon,
    ecommerce: ShoppingBagIcon,
    payments: CreditCardIcon,
    shipping: TruckIcon,
    integrations: ZapIcon,
    search: SearchIcon,
};

const SUB_GROUPS_META: Record<
    string,
    {
        titleKey: string;
        defaultTitle: string;
        descKey?: string;
        defaultDesc?: string;
    }
> = {
    p24: {
        titleKey: 'settings.subgroup_p24',
        defaultTitle: 'Przelewy24 (P24)',
        descKey: 'settings.subgroup_p24_desc',
        defaultDesc: 'Przelewy24 payment gateway integration settings',
    },
    payu: {
        titleKey: 'settings.subgroup_payu',
        defaultTitle: 'PayU',
        descKey: 'settings.subgroup_payu_desc',
        defaultDesc: 'PayU payment gateway integration settings',
    },
    bank_transfer: {
        titleKey: 'settings.subgroup_bank_transfer',
        defaultTitle: 'Bank Transfer',
        descKey: 'settings.subgroup_bank_transfer_desc',
        defaultDesc: 'Direct bank transfer payment details shown to customers',
    },
    furgonetka: {
        titleKey: 'settings.subgroup_furgonetka',
        defaultTitle: 'Furgonetka',
        descKey: 'settings.subgroup_furgonetka_desc',
        defaultDesc: 'Furgonetka courier services integration',
    },
    inpost: {
        titleKey: 'settings.subgroup_inpost',
        defaultTitle: 'InPost',
        descKey: 'settings.subgroup_inpost_desc',
        defaultDesc: 'InPost ShipX API and Geowidget settings',
    },
    stripe: {
        titleKey: 'settings.subgroup_stripe',
        defaultTitle: 'Stripe',
        descKey: 'settings.subgroup_stripe_desc',
        defaultDesc: 'Stripe payment gateway credentials',
    },
    google_maps: {
        titleKey: 'settings.subgroup_google_maps',
        defaultTitle: 'Google Maps',
        descKey: 'settings.subgroup_google_maps_desc',
        defaultDesc: 'Google Maps API integration for locations and maps',
    },
    recaptcha: {
        titleKey: 'settings.subgroup_recaptcha',
        defaultTitle: 'Google reCAPTCHA',
        descKey: 'settings.subgroup_recaptcha_desc',
        defaultDesc: 'Google reCAPTCHA v3 spam protection settings',
    },
    mailerlite: {
        titleKey: 'settings.subgroup_mailerlite',
        defaultTitle: 'MailerLite',
        descKey: 'settings.subgroup_mailerlite_desc',
        defaultDesc: 'MailerLite email marketing list settings',
    },
    google: {
        titleKey: 'settings.subgroup_google_oauth',
        defaultTitle: 'Google OAuth',
        descKey: 'settings.subgroup_google_oauth_desc',
        defaultDesc: 'Google OAuth2 sign-in settings',
    },
    github: {
        titleKey: 'settings.subgroup_github_oauth',
        defaultTitle: 'GitHub OAuth',
        descKey: 'settings.subgroup_github_oauth_desc',
        defaultDesc: 'GitHub OAuth2 sign-in settings',
    },
    cloudflare_turnstile: {
        titleKey: 'settings.subgroup_cloudflare_turnstile',
        defaultTitle: 'Cloudflare Turnstile',
        descKey: 'settings.subgroup_cloudflare_turnstile_desc',
        defaultDesc: 'Cloudflare Turnstile captcha protection settings',
    },
    mail: {
        titleKey: 'settings.subgroup_mail',
        defaultTitle: 'SMTP / Mail Server',
        descKey: 'settings.subgroup_mail_desc',
        defaultDesc: 'Outgoing mail server configuration',
    },
};

function getSubGroupKey(key: string): string | null {
    const prefixes = Object.keys(SUB_GROUPS_META).sort(
        (a, b) => b.length - a.length,
    );
    for (const prefix of prefixes) {
        if (key === prefix || key.startsWith(prefix + '_')) {
            return prefix;
        }
    }
    const parts = key.split('_');
    if (parts.length > 1) {
        return parts[0];
    }
    return null;
}

function SettingField({
    setting,
    value,
    onChange,
}: {
    setting: Setting;
    value: string;
    onChange: (val: string) => void;
}) {
    const __ = useTranslation();
    const isEncrypted = setting.type === 'encrypted';
    const isBoolean = setting.type === 'boolean';
    const isInteger = setting.type === 'integer';
    const isLong =
        setting.key === 'robots_txt' ||
        setting.key === 'site_description' ||
        setting.key === 'meta_description';

    const inputId = `setting-${setting.key}`;

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={inputId}>
                {__(
                    `settings.label.${setting.key}`,
                    setting.label ?? setting.key,
                )}
                {setting.is_public && (
                    <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {__('misc.public', 'public')}
                    </span>
                )}
            </Label>
            {setting.description && (
                <p className="text-xs text-muted-foreground">
                    {__(`settings.desc.${setting.key}`, setting.description)}
                </p>
            )}
            {isBoolean ? (
                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id={inputId}
                        checked={value === 'true' || value === '1'}
                        onChange={(e) =>
                            onChange(e.target.checked ? 'true' : 'false')
                        }
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={inputId} className="text-sm font-normal">
                        {__('status.enabled', 'Enabled')}
                    </Label>
                </div>
            ) : isLong ? (
                <Textarea
                    id={inputId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                />
            ) : (
                <Input
                    id={inputId}
                    type={
                        isEncrypted ? 'password' : isInteger ? 'number' : 'text'
                    }
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={isEncrypted ? '••••••••' : undefined}
                    autoComplete={isEncrypted ? 'new-password' : undefined}
                />
            )}
        </div>
    );
}

function GroupIcon({
    group,
    className,
}: {
    group: string;
    className?: string;
}) {
    const Icon = GROUP_ICONS[group] ?? GlobeIcon;
    return <Icon className={className} />;
}

export default function Index({ settings, groups, currentGroup }: IndexProps) {
    const __ = useTranslation();
    const initialValues = Object.fromEntries(
        settings.data.map((s) => [
            s.key,
            s.value == null ? '' : String(s.value),
        ]),
    );
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    const [processing, setProcessing] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testingMail, setTestingMail] = useState(false);

    const groupLabels: Record<string, string> = {
        general: __('nav.settings', 'General'),
        mail: __('settings.group_mail', 'Mail'),
        seo: __('settings.group_seo', 'SEO'),
        social: __('settings.group_social', 'Social Media'),
        ecommerce: __('nav.shop', 'E-commerce'),
        payments: __('settings.group_payments', 'Payments'),
        shipping: __('settings.group_shipping', 'Shipping'),
        integrations: __('settings.group_integrations', 'Integrations'),
        search: __('settings.group_search', 'Search'),
    };

    function groupLabel(group: string): string {
        return (
            groupLabels[group] ?? group.charAt(0).toUpperCase() + group.slice(1)
        );
    }

    const handleChange = (key: string, val: string) => {
        setValues((prev) => ({ ...prev, [key]: val }));
    };

    const handleGroupChange = (group: string) => {
        router.visit(SettingsController.index.url({ query: { group } }), {
            preserveState: false,
        });
    };

    const handleTestMail = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestingMail(true);
        try {
            const { data } = await axios.post<{ message: string }>(
                SettingsController.testMail.url(),
                { email: testEmail },
                {
                    headers: { Accept: 'application/json' },
                },
            );
            toast.success(data.message);
        } catch (error) {
            if (axios.isAxiosError<{ message?: string }>(error)) {
                toast.error(
                    error.response?.data?.message ??
                        __(
                            'settings.mail_test_failed',
                            'Failed to send test email.',
                        ),
                );
            } else {
                toast.error(
                    __(
                        'settings.mail_test_failed',
                        'Failed to send test email.',
                    ),
                );
            }
        } finally {
            setTestingMail(false);
        }
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(
            SettingsController.update.url(),
            { settings: values },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(__('settings.saved', 'Settings saved')),
                onError: () =>
                    toast.error(
                        __('settings.save_failed', 'Failed to save settings'),
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const getSubGroupLabel = (prefix: string): string => {
        const meta = SUB_GROUPS_META[prefix];
        if (meta) {
            return __(meta.titleKey, meta.defaultTitle);
        }
        return prefix
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getSubGroupDesc = (prefix: string): string | undefined => {
        const meta = SUB_GROUPS_META[prefix];
        if (meta && meta.descKey) {
            return __(meta.descKey, meta.defaultDesc);
        }
        return undefined;
    };

    // Grouping calculations
    const prefixCounts: Record<string, number> = {};
    settings.data.forEach((s) => {
        const prefix = getSubGroupKey(s.key);
        if (prefix) {
            prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
        }
    });

    const groupedSettings: Record<string, Setting[]> = {};
    const ungroupedSettings: Setting[] = [];

    settings.data.forEach((s) => {
        const prefix = getSubGroupKey(s.key);
        const shouldGroup =
            prefix && (SUB_GROUPS_META[prefix] || prefixCounts[prefix] >= 2);
        if (shouldGroup) {
            if (!groupedSettings[prefix]) {
                groupedSettings[prefix] = [];
            }
            groupedSettings[prefix].push(s);
        } else {
            ungroupedSettings.push(s);
        }
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
        () => {
            const initial: Record<string, boolean> = {};
            const prefixes = Object.keys(groupedSettings);
            prefixes.forEach((prefix) => {
                initial[prefix] = false;
            });
            return initial;
        },
    );

    const toggleGroup = (prefix: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [prefix]: !prev[prefix],
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.settings', 'Settings')} />

            <Wrapper>
                <PageHeader
                    title={__('page.settings', 'Settings')}
                    description={__(
                        'settings.description',
                        'Configure your application',
                    )}
                />

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <nav className="w-52 shrink-0 space-y-1">
                        {groups.map((group) => {
                            const isActive = group === currentGroup;
                            return (
                                <button
                                    key={group}
                                    onClick={() => handleGroupChange(group)}
                                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <GroupIcon
                                        group={group}
                                        className="h-4 w-4 shrink-0"
                                    />
                                    {groupLabel(group)}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Main panel */}
                    <div className="min-w-0 flex-1">
                        {settings.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'settings.no_settings',
                                        'No settings in this group.',
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-card p-6">
                                    <div className="mb-6 flex items-center gap-2 border-b pb-4">
                                        <GroupIcon
                                            group={currentGroup}
                                            className="h-5 w-5 text-muted-foreground"
                                        />
                                        <h2 className="font-semibold">
                                            {groupLabel(currentGroup)}
                                        </h2>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Render ungrouped settings first */}
                                        {ungroupedSettings.length > 0 && (
                                            <div className="mb-6 space-y-6">
                                                {ungroupedSettings.map(
                                                    (setting) => (
                                                        <SettingField
                                                            key={setting.key}
                                                            setting={setting}
                                                            value={
                                                                values[
                                                                    setting.key
                                                                ] ?? ''
                                                            }
                                                            onChange={(val) =>
                                                                handleChange(
                                                                    setting.key,
                                                                    val,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        {/* Render grouped collapsible sections */}
                                        {Object.entries(groupedSettings).map(
                                            ([prefix, items]) => {
                                                const isOpen =
                                                    !!openGroups[prefix];
                                                const title =
                                                    getSubGroupLabel(prefix);
                                                const desc =
                                                    getSubGroupDesc(prefix);
                                                const configuredCount =
                                                    items.filter((item) => {
                                                        const val =
                                                            values[item.key];
                                                        return (
                                                            val !== undefined &&
                                                            val !== null &&
                                                            val !== '' &&
                                                            val !== 'false' &&
                                                            val !== '0'
                                                        );
                                                    }).length;

                                                return (
                                                    <Collapsible
                                                        key={prefix}
                                                        open={isOpen}
                                                        onOpenChange={() =>
                                                            toggleGroup(prefix)
                                                        }
                                                        className="rounded-lg border border-muted bg-card shadow-sm transition-all duration-200"
                                                    >
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <button className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-muted/50">
                                                                <div className="space-y-1 pr-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            {
                                                                                title
                                                                            }
                                                                        </span>
                                                                        {configuredCount >
                                                                        0 ? (
                                                                            <span className="ring-green-650/10 inline-flex items-center rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 dark:bg-green-950/30 dark:text-green-400">
                                                                                {__(
                                                                                    'settings.configured',
                                                                                    'Active',
                                                                                )}{' '}
                                                                                (
                                                                                {
                                                                                    configuredCount
                                                                                }

                                                                                /
                                                                                {
                                                                                    items.length
                                                                                }

                                                                                )
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-muted-foreground/10">
                                                                                {__(
                                                                                    'settings.inactive',
                                                                                    'Inactive',
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {desc && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ChevronDown
                                                                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                                                        isOpen
                                                                            ? 'rotate-180'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="space-y-6 border-t border-muted bg-card/50 p-4">
                                                            <div className="grid gap-6">
                                                                {items.map(
                                                                    (
                                                                        setting,
                                                                    ) => (
                                                                        <SettingField
                                                                            key={
                                                                                setting.key
                                                                            }
                                                                            setting={
                                                                                setting
                                                                            }
                                                                            value={
                                                                                values[
                                                                                    setting
                                                                                        .key
                                                                                ] ??
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                val,
                                                                            ) =>
                                                                                handleChange(
                                                                                    setting.key,
                                                                                    val,
                                                                                )
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={processing}
                                    >
                                        {processing
                                            ? __('misc.saving', 'Saving...')
                                            : __(
                                                  'settings.save_btn',
                                                  'Save Settings',
                                              )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        {__(
                                            'settings.applied_immediately',
                                            'Changes are applied immediately.',
                                        )}
                                    </p>
                                </div>

                                {currentGroup === 'mail' && (
                                    <div className="rounded-lg border bg-card p-6">
                                        <div className="mb-4 flex items-center gap-2 border-b pb-4">
                                            <MailIcon className="h-5 w-5 text-muted-foreground" />
                                            <h2 className="font-semibold">
                                                {__(
                                                    'settings.mail_test_title',
                                                    'Send Test Email',
                                                )}
                                            </h2>
                                        </div>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            {__(
                                                'settings.mail_test_desc',
                                                'Send a test email to verify the current mail configuration is working correctly.',
                                            )}
                                        </p>
                                        <form
                                            onSubmit={handleTestMail}
                                            className="flex items-end gap-3"
                                        >
                                            <div className="flex-1 space-y-1.5">
                                                <Label htmlFor="test-email">
                                                    {__(
                                                        'settings.mail_test_recipient',
                                                        'Recipient Email',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="test-email"
                                                    type="email"
                                                    value={testEmail}
                                                    onChange={(e) =>
                                                        setTestEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="you@example.com"
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                disabled={
                                                    testingMail || !testEmail
                                                }
                                            >
                                                <SendIcon className="mr-2 h-4 w-4" />
                                                {testingMail
                                                    ? __(
                                                          'misc.sending',
                                                          'Sending...',
                                                      )
                                                    : __(
                                                          'settings.mail_test_btn',
                                                          'Send Test',
                                                      )}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
