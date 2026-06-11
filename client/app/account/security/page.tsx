'use client';

import { Passkeys } from '@laravel/passkeys';
import {
    Check,
    Copy,
    Fingerprint,
    Globe,
    Loader2,
    Lock,
    Plus,
    RefreshCw,
    Smartphone,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
    confirmTwoFactor,
    deleteOtherSessions,
    deletePasskey,
    deleteSession,
    disableTwoFactor,
    enableTwoFactor,
    getPasskeys,
    getSessions,
    getTwoFactorRecoveryCodes,
    regenerateRecoveryCodes,
    type ActiveSession,
    type ClientPasskey,
    type TwoFactorQrCodeResponse,
} from '@/api/auth';
import { useMe } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { api, getToken } from '@/lib/axios';

export default function SecurityPage() {
    const { t } = useTranslation();
    const { data: user, refetch: refetchUser } = useMe();

    // 2FA state
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [show2faSetup, setShow2faSetup] = useState(false);
    const [qrResponse, setQrResponse] =
        useState<TwoFactorQrCodeResponse | null>(null);
    const [totpCode, setTotpCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirming2fa, setConfirming2fa] = useState(false);
    const [disabling2fa, setDisabling2fa] = useState(false);
    const [loading2faData, setLoading2faData] = useState(false);

    // Passkeys state
    const [passkeys, setPasskeys] = useState<ClientPasskey[]>([]);
    const [loadingPasskeys, setLoadingPasskeys] = useState(true);
    const [passkeyName, setPasskeyName] = useState('');
    const [showAddPasskey, setShowAddPasskey] = useState(false);
    const [registeringPasskey, setRegisteringPasskey] = useState(false);

    // Sessions state
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [terminatingSessionId, setTerminatingSessionId] = useState<
        number | null
    >(null);
    const [terminatingOthers, setTerminatingOthers] = useState(false);

    useEffect(() => {
        if (user) {
            setIs2faEnabled(!!user.two_factor_confirmed_at);
            if (user.two_factor_confirmed_at) {
                loadRecoveryCodes();
            }
        }
    }, [user]);

    useEffect(() => {
        loadPasskeys();
        loadSessions();
    }, []);

    const loadRecoveryCodes = async () => {
        try {
            const codes = await getTwoFactorRecoveryCodes();
            setRecoveryCodes(codes);
        } catch {
            console.error('Failed to load recovery codes');
        }
    };

    const loadPasskeys = async () => {
        setLoadingPasskeys(true);
        try {
            const keys = await getPasskeys();
            setPasskeys(keys);
        } catch {
            console.error('Failed to load passkeys');
        } finally {
            setLoadingPasskeys(false);
        }
    };

    const loadSessions = async () => {
        setLoadingSessions(true);
        try {
            const data = await getSessions();
            setSessions(data);
        } catch {
            console.error('Failed to load sessions');
        } finally {
            setLoadingSessions(false);
        }
    };

    // 2FA Actions
    const handleStart2faSetup = async () => {
        setLoading2faData(true);
        try {
            const res = await enableTwoFactor();
            setQrResponse(res);
            setShow2faSetup(true);
        } catch {
            toast.error(
                t('auth.2fa_enable_failed', 'Failed to start 2FA setup.'),
            );
        } finally {
            setLoading2faData(false);
        }
    };

    const handleConfirm2fa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totpCode.length !== 6) return;

        setConfirming2fa(true);
        try {
            const res = await confirmTwoFactor(totpCode);
            toast.success(
                t(
                    'auth.2fa_enabled_success',
                    'Two-factor authentication enabled successfully!',
                ),
            );
            setRecoveryCodes(res.recovery_codes);
            setIs2faEnabled(true);
            setShow2faSetup(false);
            setTotpCode('');
            await refetchUser();
        } catch {
            toast.error(
                t(
                    'auth.2fa_confirm_failed',
                    'Invalid verification code. Please try again.',
                ),
            );
        } finally {
            setConfirming2fa(false);
        }
    };

    const handleDisable2fa = async () => {
        if (
            !confirm(
                t(
                    'auth.confirm_disable_2fa',
                    'Are you sure you want to disable 2FA? This will decrease account security.',
                ),
            )
        ) {
            return;
        }

        setDisabling2fa(true);
        try {
            await disableTwoFactor();
            toast.success(
                t(
                    'auth.2fa_disabled_success',
                    'Two-factor authentication disabled.',
                ),
            );
            setIs2faEnabled(false);
            setRecoveryCodes([]);
            setQrResponse(null);
            await refetchUser();
        } catch {
            toast.error(t('auth.2fa_disable_failed', 'Failed to disable 2FA.'));
        } finally {
            setDisabling2fa(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        try {
            const codes = await regenerateRecoveryCodes();
            setRecoveryCodes(codes);
            toast.success(
                t(
                    'auth.recovery_codes_regenerated',
                    'New recovery codes generated.',
                ),
            );
        } catch {
            toast.error(
                t(
                    'auth.recovery_codes_regenerated_failed',
                    'Failed to regenerate recovery codes.',
                ),
            );
        }
    };

    // Passkey Actions
    const handleAddPasskey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passkeyName.trim()) return;

        setRegisteringPasskey(true);
        try {
            // Configure Passkeys package
            Passkeys.configure({
                fetch: {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            });

            // Call Laravel Passkeys package register flow
            await Passkeys.register({
                name: passkeyName,
                routes: {
                    options: `${api.defaults.baseURL}/auth/passkeys/register/options`,
                    submit: `${api.defaults.baseURL}/auth/passkeys/register`,
                },
            });

            toast.success(
                t(
                    'auth.passkey_registered_success',
                    'Passkey added successfully!',
                ),
            );
            setPasskeyName('');
            setShowAddPasskey(false);
            await loadPasskeys();
        } catch (err) {
            const error = err as Error;
            const isCancel =
                error.name === 'NotAllowedError' ||
                error.name === 'AbortError' ||
                error.name === 'UserCancelledError' ||
                error.toString().includes('UserCancelledError') ||
                error.message?.includes('cancelled');

            if (!isCancel) {
                console.error('Passkey registration error:', error);
                toast.error(
                    t(
                        'auth.passkey_registration_failed',
                        'Failed to register Passkey. Please try again.',
                    ),
                );
            } else {
                console.log('Passkey registration cancelled by user.');
            }
        } finally {
            setRegisteringPasskey(false);
        }
    };

    const handleDeletePasskey = async (id: number) => {
        if (
            !confirm(
                t(
                    'auth.confirm_delete_passkey',
                    'Are you sure you want to remove this passkey?',
                ),
            )
        ) {
            return;
        }

        try {
            await deletePasskey(id);
            toast.success(
                t('auth.passkey_deleted_success', 'Passkey removed.'),
            );
            await loadPasskeys();
        } catch {
            toast.error(
                t('auth.passkey_deletion_failed', 'Failed to delete passkey.'),
            );
        }
    };

    // Session Actions
    const handleTerminateSession = async (id: number) => {
        setTerminatingSessionId(id);
        try {
            await deleteSession(id);
            toast.success(t('auth.session_terminated', 'Session terminated.'));
            await loadSessions();
        } catch {
            toast.error(
                t(
                    'auth.session_termination_failed',
                    'Failed to terminate session.',
                ),
            );
        } finally {
            setTerminatingSessionId(null);
        }
    };

    const handleTerminateOthers = async () => {
        if (
            !confirm(
                t(
                    'auth.confirm_terminate_others',
                    'Are you sure you want to log out all other devices?',
                ),
            )
        ) {
            return;
        }

        setTerminatingOthers(true);
        try {
            await deleteOtherSessions();
            toast.success(
                t(
                    'auth.other_sessions_terminated',
                    'Logged out of all other devices.',
                ),
            );
            await loadSessions();
        } catch {
            toast.error(
                t(
                    'auth.other_sessions_termination_failed',
                    'Failed to log out of other devices.',
                ),
            );
        } finally {
            setTerminatingOthers(false);
        }
    };

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        toast.info(
            t('auth.codes_copied', 'Recovery codes copied to clipboard.'),
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                    {t('account.security_settings', 'Security Settings')}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {t(
                        'account.security_settings_desc',
                        'Manage your account authentication methods, active sessions, and multi-factor security.',
                    )}
                </p>
            </div>

            {/* Two-Factor Authentication (2FA) */}
            <section className="border-border bg-card rounded-2xl border p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-foreground text-lg font-semibold">
                                {t(
                                    'auth.two_factor_auth',
                                    'Two-Factor Authentication (2FA)',
                                )}
                            </h2>
                            <p className="text-muted-foreground max-w-xl text-sm">
                                {t(
                                    'auth.2fa_desc',
                                    'Add an extra layer of security to your account by requiring a verification code from your authenticator app during sign in.',
                                )}
                            </p>
                        </div>
                    </div>
                    <div>
                        {is2faEnabled ? (
                            <button
                                onClick={handleDisable2fa}
                                disabled={disabling2fa}
                                className="border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                {disabling2fa
                                    ? '…'
                                    : t('common.disable', 'Disable')}
                            </button>
                        ) : (
                            <button
                                onClick={handleStart2faSetup}
                                disabled={loading2faData || show2faSetup}
                                className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {loading2faData ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                {t('common.setup', 'Setup 2FA')}
                            </button>
                        )}
                    </div>
                </div>

                {/* 2FA Setup Flow */}
                {show2faSetup && qrResponse && (
                    <div className="border-border bg-muted/30 animate-in fade-in-50 mt-6 space-y-6 rounded-xl border p-6 duration-200">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <h3 className="text-foreground font-semibold">
                                {t(
                                    'auth.setup_2fa_title',
                                    'Configure Authenticator App',
                                )}
                            </h3>
                            <button
                                onClick={() => setShow2faSetup(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                            <div className="mx-auto flex max-w-[220px] flex-col items-center justify-center rounded-xl border bg-white p-4">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: qrResponse.svg,
                                    }}
                                    className="h-full w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm">
                                    <li>
                                        {t(
                                            'auth.2fa_step1',
                                            'Scan the QR code using your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, etc.).',
                                        )}
                                    </li>
                                    <li>
                                        {t(
                                            'auth.2fa_step2',
                                            'Alternatively, manually enter this secret key:',
                                        )}{' '}
                                        <code className="bg-muted text-foreground mt-1 block rounded border p-2 font-mono break-all select-all">
                                            {qrResponse.secret}
                                        </code>
                                    </li>
                                    <li>
                                        {t(
                                            'auth.2fa_step3',
                                            'Enter the 6-digit confirmation code generated by your app below.',
                                        )}
                                    </li>
                                </ol>

                                <form
                                    onSubmit={handleConfirm2fa}
                                    className="flex max-w-sm items-end gap-3"
                                >
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="000000"
                                            value={totpCode}
                                            onChange={(e) =>
                                                setTotpCode(e.target.value)
                                            }
                                            className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2 text-center font-mono text-lg text-sm tracking-widest focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={
                                            confirming2fa ||
                                            totpCode.length !== 6
                                        }
                                        className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                    >
                                        {confirming2fa
                                            ? '…'
                                            : t('common.confirm', 'Confirm')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2FA Recovery Codes */}
                {is2faEnabled && recoveryCodes.length > 0 && (
                    <div className="border-border bg-muted/20 mt-6 space-y-4 rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-foreground font-semibold">
                                    {t(
                                        'auth.recovery_codes',
                                        'Emergency Recovery Codes',
                                    )}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    {t(
                                        'auth.recovery_codes_desc',
                                        'Save these codes in a secure location. They allow access to your account if you lose your authenticator device.',
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyRecoveryCodes}
                                    className="border-border hover:bg-accent text-foreground rounded-lg border p-2 transition-all"
                                    title="Copy Codes"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleRegenerateRecoveryCodes}
                                    className="border-border hover:bg-accent text-foreground rounded-lg border p-2 transition-all"
                                    title="Regenerate Codes"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center font-mono text-sm sm:grid-cols-4">
                            {recoveryCodes.map((code) => (
                                <div
                                    key={code}
                                    className="bg-muted text-foreground rounded-lg border p-2"
                                >
                                    {code}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Passkeys (Face ID / Touch ID / WebAuthn) */}
            <section className="border-border bg-card space-y-6 rounded-2xl border p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            <Fingerprint className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-foreground text-lg font-semibold">
                                {t('auth.passkeys', 'Passkeys & Biometrics')}
                            </h2>
                            <p className="text-muted-foreground max-w-xl text-sm">
                                {t(
                                    'auth.passkeys_desc',
                                    "Sign in securely without a password using Touch ID, Face ID, or your device's security PIN/key.",
                                )}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowAddPasskey(!showAddPasskey)}
                            className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            {t('auth.add_passkey', 'Add Passkey')}
                        </button>
                    </div>
                </div>

                {/* Add Passkey Form */}
                {showAddPasskey && (
                    <form
                        onSubmit={handleAddPasskey}
                        className="border-border bg-muted/30 animate-in fade-in-50 space-y-4 rounded-xl border p-6 duration-200"
                    >
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <h3 className="text-foreground font-semibold">
                                {t(
                                    'auth.add_passkey_title',
                                    'Register New Passkey',
                                )}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAddPasskey(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex max-w-md items-end gap-3">
                            <div className="flex-1">
                                <label
                                    htmlFor="passkey-name"
                                    className="mb-1 block text-sm font-medium"
                                >
                                    {t(
                                        'auth.passkey_name',
                                        'Friendly device name',
                                    )}
                                </label>
                                <input
                                    id="passkey-name"
                                    type="text"
                                    required
                                    placeholder={t(
                                        'auth.passkey_name_placeholder',
                                        'e.g. My MacBook Air',
                                    )}
                                    value={passkeyName}
                                    onChange={(e) =>
                                        setPasskeyName(e.target.value)
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={registeringPasskey || !passkeyName}
                                className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {registeringPasskey
                                    ? '…'
                                    : t('common.register', 'Register')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Passkey List */}
                {loadingPasskeys ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                ) : passkeys.length === 0 ? (
                    <div className="bg-muted/10 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            {t(
                                'auth.no_passkeys',
                                'No passkeys registered yet.',
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="divide-border divide-y overflow-hidden rounded-xl border">
                        {passkeys.map((key) => (
                            <div
                                key={key.id}
                                className="bg-card hover:bg-muted/10 flex items-center justify-between p-4 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Fingerprint className="text-muted-foreground h-5 w-5" />
                                    <div>
                                        <p className="text-foreground text-sm font-medium">
                                            {key.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {t('common.added', 'Added')}:{' '}
                                            {new Date(
                                                key.created_at,
                                            ).toLocaleDateString()}
                                            {key.last_used_at
                                                ? ` | ${t('common.last_used', 'Last used')}: ${new Date(key.last_used_at).toLocaleDateString()}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePasskey(key.id)}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Active Sessions (Device / Token Security) */}
            <section className="border-border bg-card space-y-6 rounded-2xl border p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-foreground text-lg font-semibold">
                                {t(
                                    'auth.active_sessions',
                                    'Active Sessions & Devices',
                                )}
                            </h2>
                            <p className="text-muted-foreground max-w-xl text-sm">
                                {t(
                                    'auth.active_sessions_desc',
                                    'List of devices currently logged in to your account. You can log out of individual sessions or terminate all other sessions.',
                                )}
                            </p>
                        </div>
                    </div>
                    {sessions.some((s) => !s.is_current) && (
                        <div>
                            <button
                                onClick={handleTerminateOthers}
                                disabled={terminatingOthers}
                                className="border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                {terminatingOthers
                                    ? '…'
                                    : t(
                                          'auth.logout_others',
                                          'Logout Other Devices',
                                      )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Session List */}
                {loadingSessions ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="divide-border divide-y overflow-hidden rounded-xl border">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-card hover:bg-muted/10 flex items-center justify-between p-4 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-muted-foreground">
                                        {session.platform === 'iOS' ||
                                        session.platform === 'Android' ? (
                                            <Smartphone className="h-5 w-5" />
                                        ) : (
                                            <Globe className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground text-sm font-medium">
                                                {session.device ||
                                                    'API Connection'}
                                            </span>
                                            {session.is_current && (
                                                <span className="bg-primary/10 text-primary flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                                    <Check className="h-2.5 w-2.5" />
                                                    {t(
                                                        'auth.current_session',
                                                        'Current Session',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            IP:{' '}
                                            {session.ip_address || 'Unknown'} |{' '}
                                            {t(
                                                'common.last_used',
                                                'Last active',
                                            )}
                                            :{' '}
                                            {session.last_used_at
                                                ? new Date(
                                                      session.last_used_at,
                                                  ).toLocaleString()
                                                : new Date(
                                                      session.created_at,
                                                  ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {!session.is_current && (
                                    <button
                                        onClick={() =>
                                            handleTerminateSession(session.id)
                                        }
                                        disabled={
                                            terminatingSessionId === session.id
                                        }
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-all disabled:opacity-50"
                                        title={t(
                                            'auth.terminate_session',
                                            'Log out device',
                                        )}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
