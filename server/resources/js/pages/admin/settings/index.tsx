import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Setting, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: SettingsController.index.url() },
];

const GROUP_ICONS: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    general: SettingsIcon,
    mail: MailIcon,
    seo: SearchIcon,
    social: ShareIcon,
    ecommerce: ShoppingBagIcon,
    payments: CreditCardIcon,
    shipping: TruckIcon,
    integrations: ZapIcon,
};

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
                                        {settings.data.map((setting) => (
                                            <SettingField
                                                key={setting.key}
                                                setting={setting}
                                                value={
                                                    values[setting.key] ?? ''
                                                }
                                                onChange={(val) =>
                                                    handleChange(
                                                        setting.key,
                                                        val,
                                                    )
                                                }
                                            />
                                        ))}
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
