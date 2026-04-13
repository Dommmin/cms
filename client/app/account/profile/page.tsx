'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    useAddresses,
    useCreateAddress,
    useDeleteAccount,
    useDeleteAddress,
    useProfile,
    useSetDefaultAddress,
    useUpdatePassword,
    useUpdateProfile,
} from '@/hooks/use-profile';
import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';
import type {
    AddressForm,
    ConsentState,
    DeleteAccountModalState,
    ProcessingRestrictionState,
} from './page.types';

const EMPTY_ADDRESS: AddressForm = {
    type: 'shipping',
    first_name: '',
    last_name: '',
    company_name: null,
    street: '',
    street2: null,
    city: '',
    postal_code: '',
    country_code: 'PL',
    phone: null,
};

export default function ProfilePage() {
    const { data: profile, isLoading } = useProfile();
    const { mutate: updateProfile, isPending: savingProfile } =
        useUpdateProfile();
    const { mutate: updatePassword, isPending: savingPassword } =
        useUpdatePassword();
    const { mutate: deleteAccount, isPending: deletingAccount } =
        useDeleteAccount();
    const { t } = useTranslation();

    const { data: addresses = [] } = useAddresses();
    const { mutate: createAddress, isPending: addingAddress } =
        useCreateAddress();
    const { mutate: deleteAddress } = useDeleteAddress();
    const { mutate: setDefault } = useSetDefaultAddress();

    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<AddressForm>({
        ...EMPTY_ADDRESS,
    });
    const [addressErrors, setAddressErrors] = useState<
        Record<string, string[]>
    >({});
    const [passwordErrors, setPasswordErrors] = useState<
        Record<string, string[]>
    >({});
    const [exportingData, setExportingData] = useState(false);
    const [deleteModal, setDeleteModal] = useState<DeleteAccountModalState>({
        open: false,
        password: '',
        error: null,
    });
    const [consent, setConsent] = useState<ConsentState>({
        analytics: false,
        marketing: false,
    });
    const [savingConsent, setSavingConsent] = useState(false);
    const [processingRestriction, setProcessingRestriction] =
        useState<ProcessingRestrictionState>({
            restricted: false,
            restricted_since: null,
        });
    const [togglingRestriction, setTogglingRestriction] = useState(false);

    useEffect(() => {
        api.get<{
            analytics: boolean;
            marketing: boolean;
        }>('/consent').then((res) => {
            setConsent({
                analytics: res.data.analytics,
                marketing: res.data.marketing,
            });
        });
    }, []);

    useEffect(() => {
        if (!profile) return;
        const restrictedAt = profile.processing_restricted_at ?? null;
        setProcessingRestriction({
            restricted: restrictedAt !== null,
            restricted_since: restrictedAt,
        });
    }, [profile]);

    async function handleExportData() {
        setExportingData(true);
        try {
            const response = await api.get('/profile/export', {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-data.json';
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExportingData(false);
        }
    }

    async function handleSaveConsent() {
        setSavingConsent(true);
        try {
            await api.post('/consent', {
                analytics: consent.analytics,
                marketing: consent.marketing,
                functional: true,
            });
        } finally {
            setSavingConsent(false);
        }
    }

    async function handleToggleProcessingRestriction() {
        setTogglingRestriction(true);
        try {
            if (processingRestriction.restricted) {
                await api.delete('/profile/restrict-processing');
                setProcessingRestriction({
                    restricted: false,
                    restricted_since: null,
                });
            } else {
                const res = await api.post('/profile/restrict-processing');
                const restrictedAt =
                    (
                        res.data as {
                            processing_restricted_at?: string | null;
                        }
                    )?.processing_restricted_at ?? new Date().toISOString();
                setProcessingRestriction({
                    restricted: true,
                    restricted_since: restrictedAt,
                });
            }
        } finally {
            setTogglingRestriction(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        );
    }

    function handleProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateProfile({
            name: profileForm.name || profile?.name || '',
            email: profileForm.email || profile?.email || '',
        });
    }

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPasswordErrors({});
        updatePassword(passwordForm, {
            onSuccess: () => {
                setPasswordForm({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                setPasswordErrors({});
            },
            onError: (err: unknown) => {
                const errors = (
                    err as {
                        response?: {
                            data?: { errors?: Record<string, string[]> };
                        };
                    }
                )?.response?.data?.errors;
                if (errors) setPasswordErrors(errors);
            },
        });
    }

    function handleAddAddress(e: React.FormEvent) {
        e.preventDefault();
        setAddressErrors({});
        createAddress(newAddress, {
            onSuccess: () => {
                setShowAddAddress(false);
                setNewAddress({ ...EMPTY_ADDRESS });
                setAddressErrors({});
            },
            onError: (err: unknown) => {
                const errors = (
                    err as {
                        response?: {
                            data?: { errors?: Record<string, string[]> };
                        };
                    }
                )?.response?.data?.errors;
                if (errors) setAddressErrors(errors);
            },
        });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">
                {t('account.profile_title', 'Profile')}
            </h1>

            {/* ── Personal info ─────────────────────────────────────────── */}
            <section className="border-border rounded-xl border p-6">
                <h2 className="mb-4 text-base font-semibold">
                    {t('account.personal_info', 'Personal information')}
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t('auth.full_name', 'Full Name')}
                            </label>
                            <input
                                type="text"
                                defaultValue={profile?.name}
                                onChange={(e) =>
                                    setProfileForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t('auth.email', 'Email address')}
                            </label>
                            <input
                                type="email"
                                defaultValue={profile?.email}
                                onChange={(e) =>
                                    setProfileForm((p) => ({
                                        ...p,
                                        email: e.target.value,
                                    }))
                                }
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {savingProfile
                            ? t('account.saving', 'Saving…')
                            : t('account.save_changes', 'Save changes')}
                    </button>
                </form>
            </section>

            {/* ── Change password ───────────────────────────────────────── */}
            <section className="border-border rounded-xl border p-6">
                <h2 className="mb-4 text-base font-semibold">
                    {t('account.change_password', 'Change password')}
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            {t('auth.current_password', 'Current Password')}
                        </label>
                        <input
                            type="password"
                            required
                            value={passwordForm.current_password}
                            onChange={(e) =>
                                setPasswordForm((p) => ({
                                    ...p,
                                    current_password: e.target.value,
                                }))
                            }
                            className={`bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${passwordErrors.current_password ? 'border-destructive' : 'border-input'}`}
                        />
                        {passwordErrors.current_password && (
                            <p className="text-destructive mt-1 text-xs">
                                {passwordErrors.current_password[0]}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t('auth.new_password', 'New password')}
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordForm.password}
                                onChange={(e) =>
                                    setPasswordForm((p) => ({
                                        ...p,
                                        password: e.target.value,
                                    }))
                                }
                                className={`bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${passwordErrors.password ? 'border-destructive' : 'border-input'}`}
                            />
                            {passwordErrors.password && (
                                <p className="text-destructive mt-1 text-xs">
                                    {passwordErrors.password[0]}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t(
                                    'auth.confirm_password',
                                    'Confirm new password',
                                )}
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordForm.password_confirmation}
                                onChange={(e) =>
                                    setPasswordForm((p) => ({
                                        ...p,
                                        password_confirmation: e.target.value,
                                    }))
                                }
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {savingPassword
                            ? t('account.saving', 'Saving…')
                            : t('account.update_password', 'Update password')}
                    </button>
                </form>
            </section>

            {/* ── Addresses ─────────────────────────────────────────────── */}
            <section className="border-border rounded-xl border p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold">
                        {t('account.saved_addresses', 'Saved addresses')}
                    </h2>
                    <button
                        onClick={() => setShowAddAddress((v) => !v)}
                        className="text-primary text-sm font-medium hover:opacity-80"
                    >
                        {showAddAddress
                            ? t('common.cancel', 'Cancel')
                            : t('account.add_address', '+ Add address')}
                    </button>
                </div>

                {showAddAddress && (
                    <form
                        onSubmit={handleAddAddress}
                        className="bg-muted/30 mb-6 space-y-3 rounded-lg p-4"
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.first_name', 'First Name *')}
                                </label>
                                <input
                                    required
                                    value={newAddress.first_name}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            first_name: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.first_name && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.first_name[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.last_name', 'Last Name *')}
                                </label>
                                <input
                                    required
                                    value={newAddress.last_name}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            last_name: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.last_name && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.last_name[0]}
                                    </p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.street', 'Street & Number *')}
                                </label>
                                <input
                                    required
                                    value={newAddress.street}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            street: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.street && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.street[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.postal_code', 'Postal Code *')}
                                </label>
                                <input
                                    required
                                    value={newAddress.postal_code}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            postal_code: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.postal_code && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.postal_code[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.city', 'City *')}
                                </label>
                                <input
                                    required
                                    value={newAddress.city}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            city: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.city && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.city[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.country', 'Country *')}
                                </label>
                                <input
                                    required
                                    maxLength={2}
                                    value={newAddress.country_code}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            country_code:
                                                e.target.value.toUpperCase(),
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                                {addressErrors.country_code && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {addressErrors.country_code[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">
                                    {t('address.phone', 'Phone *')}
                                </label>
                                <input
                                    type="tel"
                                    value={newAddress.phone ?? ''}
                                    onChange={(e) =>
                                        setNewAddress((p) => ({
                                            ...p,
                                            phone: e.target.value || null,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={addingAddress}
                            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {addingAddress
                                ? t('account.saving', 'Saving…')
                                : t('account.save_address', 'Save address')}
                        </button>
                    </form>
                )}

                {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {t('account.no_addresses', 'No saved addresses.')}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {addresses.map((addr) => (
                            <li
                                key={addr.id}
                                className="border-border flex items-start justify-between rounded-lg border p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {addr.first_name} {addr.last_name}
                                        {addr.is_default && (
                                            <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-xs">
                                                {t(
                                                    'address.default_suffix',
                                                    '(default)',
                                                )}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {addr.street}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {addr.postal_code} {addr.city},{' '}
                                        {addr.country_code}
                                    </p>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    {!addr.is_default && (
                                        <button
                                            onClick={() => setDefault(addr.id)}
                                            className="text-primary hover:opacity-80"
                                        >
                                            {t(
                                                'account.set_default',
                                                'Set default',
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteAddress(addr.id)}
                                        className="text-destructive hover:opacity-80"
                                    >
                                        {t('common.delete', 'Remove')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* ── Cookie Preferences ───────────────────────────────────── */}
            <section className="border-border rounded-xl border p-6">
                <h2 className="mb-2 text-base font-semibold">
                    {t('account.cookie_preferences', 'Cookie Preferences')}
                </h2>
                <p className="text-muted-foreground mb-4 text-sm">
                    {t(
                        'account.cookie_preferences_desc',
                        'Manage your cookie consent choices. Functional cookies are always required for the site to work.',
                    )}
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                {t(
                                    'account.cookie_functional',
                                    'Functional (required)',
                                )}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {t(
                                    'account.cookie_functional_desc',
                                    'Essential for site operation.',
                                )}
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked
                            disabled
                            aria-label={t(
                                'account.cookie_functional',
                                'Functional (required)',
                            )}
                            className="h-4 w-4 cursor-not-allowed opacity-50"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                {t('account.cookie_analytics', 'Analytics')}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {t(
                                    'account.cookie_analytics_desc',
                                    'Helps us understand how you use the site.',
                                )}
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={consent.analytics}
                            onChange={(e) =>
                                setConsent((c) => ({
                                    ...c,
                                    analytics: e.target.checked,
                                }))
                            }
                            aria-label={t(
                                'account.cookie_analytics',
                                'Analytics',
                            )}
                            className="h-4 w-4 cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                {t('account.cookie_marketing', 'Marketing')}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {t(
                                    'account.cookie_marketing_desc',
                                    'Used for personalised ads and offers.',
                                )}
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={consent.marketing}
                            onChange={(e) =>
                                setConsent((c) => ({
                                    ...c,
                                    marketing: e.target.checked,
                                }))
                            }
                            aria-label={t(
                                'account.cookie_marketing',
                                'Marketing',
                            )}
                            className="h-4 w-4 cursor-pointer"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSaveConsent}
                    disabled={savingConsent}
                    className="bg-primary text-primary-foreground mt-4 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    {savingConsent
                        ? t('account.saving', 'Saving…')
                        : t('account.save_preferences', 'Save preferences')}
                </button>
            </section>

            {/* ── Data Processing (Art. 18) ─────────────────────────────── */}
            <section className="border-border rounded-xl border p-6">
                <h2 className="mb-2 text-base font-semibold">
                    {t('account.data_processing', 'Data Processing')}
                </h2>
                <p className="text-muted-foreground mb-1 text-sm">
                    {t(
                        'account.data_processing_desc',
                        "Restricting processing means we'll keep your data but won't use it for personalisation or marketing while you dispute its accuracy.",
                    )}
                </p>
                <p className="text-muted-foreground mb-4 text-sm">
                    {processingRestriction.restricted &&
                    processingRestriction.restricted_since ? (
                        <>
                            <span className="font-medium text-amber-600">
                                {t(
                                    'account.processing_restricted',
                                    'Processing restricted since',
                                )}{' '}
                            </span>
                            {new Date(
                                processingRestriction.restricted_since,
                            ).toLocaleDateString()}
                        </>
                    ) : (
                        <span className="font-medium text-green-600">
                            {t(
                                'account.processing_active',
                                'Processing active',
                            )}
                        </span>
                    )}
                </p>
                <button
                    onClick={handleToggleProcessingRestriction}
                    disabled={togglingRestriction}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                        processingRestriction.restricted
                            ? 'border-border hover:bg-accent'
                            : 'border-amber-400 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                    }`}
                >
                    {togglingRestriction
                        ? t('account.saving', 'Saving…')
                        : processingRestriction.restricted
                          ? t(
                                'account.resume_processing',
                                'Resume data processing',
                            )
                          : t(
                                'account.restrict_processing',
                                'Restrict data processing',
                            )}
                </button>
            </section>

            {/* ── Danger zone ───────────────────────────────────────────── */}
            <section className="border-destructive/30 rounded-xl border p-6">
                <h2 className="text-destructive mb-2 text-base font-semibold">
                    {t('account.danger_zone', 'Danger zone')}
                </h2>
                <p className="text-muted-foreground mb-4 text-sm">
                    {t(
                        'account.danger_zone_desc',
                        'Permanently delete your account and all associated data. This cannot be undone.',
                    )}
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExportData}
                        disabled={exportingData}
                        className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        {exportingData
                            ? t('account.downloading_data', 'Downloading…')
                            : t('account.download_data', 'Download my data')}
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                open: true,
                                password: '',
                                error: null,
                            })
                        }
                        disabled={deletingAccount}
                        className="border-destructive text-destructive hover:bg-destructive/10 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        {deletingAccount
                            ? t('account.deleting_account', 'Deleting…')
                            : t('account.delete_account', 'Delete account')}
                    </button>
                </div>
            </section>

            {/* ── Delete account modal ─────────────────────────────────────── */}
            {deleteModal.open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-account-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                >
                    <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl">
                        <h2
                            id="delete-account-title"
                            className="text-destructive mb-2 text-base font-semibold"
                        >
                            {t('account.delete_account', 'Delete account')}
                        </h2>
                        <p className="text-muted-foreground mb-4 text-sm">
                            {t(
                                'account.delete_confirm',
                                'Are you sure you want to delete your account? This cannot be undone.',
                            )}
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setDeleteModal((s) => ({ ...s, error: null }));
                                deleteAccount(deleteModal.password, {
                                    onError: (err: unknown) => {
                                        const e = err as {
                                            response?: {
                                                data?: {
                                                    errors?: {
                                                        password?: string[];
                                                    };
                                                    message?: string;
                                                };
                                            };
                                        };
                                        const msg =
                                            e?.response?.data?.errors
                                                ?.password?.[0] ??
                                            e?.response?.data?.message ??
                                            t(
                                                'account.delete_error',
                                                'Failed to delete account.',
                                            );
                                        setDeleteModal((s) => ({
                                            ...s,
                                            error: msg,
                                        }));
                                    },
                                });
                            }}
                        >
                            <label
                                htmlFor="delete-password"
                                className="mb-1 block text-sm font-medium"
                            >
                                {t(
                                    'account.confirm_password',
                                    'Confirm your password',
                                )}
                            </label>
                            <input
                                id="delete-password"
                                type="password"
                                autoFocus
                                value={deleteModal.password}
                                onChange={(e) =>
                                    setDeleteModal((s) => ({
                                        ...s,
                                        password: e.target.value,
                                    }))
                                }
                                className="border-border bg-background focus:ring-destructive mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                                required
                            />
                            {deleteModal.error && (
                                <p className="text-destructive mb-3 text-xs">
                                    {deleteModal.error}
                                </p>
                            )}
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteModal({
                                            open: false,
                                            password: '',
                                            error: null,
                                        })
                                    }
                                    className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm font-medium"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        deletingAccount || !deleteModal.password
                                    }
                                    className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                                >
                                    {deletingAccount
                                        ? t(
                                              'account.deleting_account',
                                              'Deleting…',
                                          )
                                        : t(
                                              'account.delete_account',
                                              'Delete account',
                                          )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
