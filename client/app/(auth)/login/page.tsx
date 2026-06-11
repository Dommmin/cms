'use client';

import { Passkeys } from '@laravel/passkeys';
import { isAxiosError } from 'axios';
import {
    ArrowLeft,
    Fingerprint,
    Key,
    Lock,
    Mail,
    ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { sendOtp } from '@/api/auth';
import { MergeDialog } from '@/components/merge-dialog';
import { SocialLoginButtons } from '@/components/social-login-buttons';
import { TurnstileWidget } from '@/components/turnstile-widget';
import {
    useLogin,
    useOtpVerify,
    usePasskeyLogin,
    useTwoFactorChallenge,
} from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';

type LoginStep =
    | 'method-select'
    | 'password'
    | 'otp-email'
    | 'otp-code'
    | '2fa';

export default function LoginPage() {
    const {
        mutateAsync: login,
        isPending: isLoggingIn,
        error: loginError,
        mergeDialogState,
        confirmMerge,
    } = useLogin();

    const { mutateAsync: verifyOtpCode, isPending: isVerifyingOtp } =
        useOtpVerify();
    const { mutateAsync: verifyChallenge, isPending: isVerifyingChallenge } =
        useTwoFactorChallenge();
    const { mutateAsync: loginWithPasskey, isPending: isVerifyingPasskey } =
        usePasskeyLogin();

    const { t } = useTranslation();
    const lp = useLocalePath();

    // UI state
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>(
        'password',
    );
    const [step, setStep] = useState<LoginStep>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    // 2FA challenge state
    const [challengeToken, setChallengeToken] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    // Cooldown timer for resending OTP
    useEffect(() => {
        if (otpCooldown > 0) {
            const timer = setTimeout(
                () => setOtpCooldown(otpCooldown - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [otpCooldown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setLocalError(
                t('auth.invalid_email', 'Please enter a valid email address.'),
            );
            return;
        }

        setSendingOtp(true);
        setLocalError(null);
        try {
            await sendOtp(email);
            toast.success(
                t('auth.otp_sent', 'Verification code sent to your email.'),
            );
            setOtpSent(true);
            setStep('otp-code');
            setOtpCooldown(60);
        } catch (err) {
            const msg = isAxiosError(err) ? err.response?.data?.message : null;
            setLocalError(
                msg ??
                    t(
                        'auth.otp_send_failed',
                        'Failed to send verification code.',
                    ),
            );
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            setLocalError(
                t(
                    'auth.invalid_code_length',
                    'Code must be exactly 6 characters.',
                ),
            );
            return;
        }

        setLocalError(null);
        try {
            const response = await verifyOtpCode({ email, code: otpCode });
            if (response.two_factor_challenge) {
                setChallengeToken(response.challenge_token!);
                setStep('2fa');
            }
        } catch (err) {
            const msg = isAxiosError(err) ? err.response?.data?.message : null;
            setLocalError(
                msg ?? t('auth.otp_verify_failed', 'Invalid or expired code.'),
            );
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            const response = await login({
                email,
                password,
                cf_turnstile_response: turnstileToken || undefined,
            });

            if (response.two_factor_challenge) {
                setChallengeToken(response.challenge_token!);
                setStep('2fa');
            }
        } catch (err) {
            const msg = isAxiosError(err) ? err.response?.data?.message : null;
            setLocalError(
                msg ??
                    t('auth.login_failed', 'Login failed. Please try again.'),
            );
        }
    };

    const handle2faSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!challengeToken) return;

        setLocalError(null);
        try {
            await verifyChallenge({
                challenge_token: challengeToken,
                code: useRecoveryCode ? undefined : twoFactorCode,
                recovery_code: useRecoveryCode ? twoFactorCode : undefined,
            });
        } catch (err) {
            const msg = isAxiosError(err) ? err.response?.data?.message : null;
            setLocalError(
                msg ??
                    t(
                        'auth.two_factor_failed',
                        'Invalid verification or recovery code.',
                    ),
            );
        }
    };

    const handlePasskeyLogin = async () => {
        setLocalError(null);
        try {
            // Get login/verification options from API
            const { data } = await api.get<{
                challenge_id: string;
                options: unknown;
            }>('/auth/passkeys/login/options');

            // Configure Passkeys endpoints for WebAuthn ceremony
            Passkeys.configure({
                fetch: {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            });

            // Perform browser WebAuthn ceremony
            const credential = await Passkeys.verify({
                routes: {
                    options: `${api.defaults.baseURL}/auth/passkeys/login/options`,
                    submit: `${api.defaults.baseURL}/auth/passkeys/login`,
                },
            });

            // Pass authentication data to our token handler hook
            const response = await loginWithPasskey({
                challenge_id: data.challenge_id,
                credential,
            });

            if (response.two_factor_challenge) {
                setChallengeToken(response.challenge_token!);
                setStep('2fa');
            }
        } catch (err) {
            const error = err as Error;
            const isCancel =
                error.name === 'NotAllowedError' ||
                error.name === 'AbortError' ||
                error.name === 'UserCancelledError' ||
                error.toString().includes('UserCancelledError') ||
                error.message?.includes('cancelled');

            if (!isCancel) {
                console.error('Passkey authentication failed:', err);
                const msg = isAxiosError(err)
                    ? err.response?.data?.message
                    : null;
                setLocalError(
                    msg ??
                        t(
                            'auth.passkey_failed',
                            'Passkey login failed. Please try again or use another method.',
                        ),
                );
            } else {
                console.log('Passkey authentication cancelled by user.');
            }
        }
    };

    const errorMessage =
        localError ??
        (isAxiosError(loginError)
            ? loginError.response?.data?.message
            : null) ??
        (loginError
            ? t('auth.login_failed', 'Login failed. Please try again.')
            : null);

    return (
        <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
            <MergeDialog
                open={mergeDialogState !== null}
                state={mergeDialogState}
                onConfirm={confirmMerge}
            />

            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
                {step === '2fa' ? (
                    <div>
                        <h1 className="mb-2 text-center text-2xl font-bold">
                            {t(
                                'auth.two_factor_title',
                                'Two-Factor Authentication',
                            )}
                        </h1>
                        <p className="text-muted-foreground mb-6 text-center text-sm">
                            {useRecoveryCode
                                ? t(
                                      'auth.enter_recovery_code',
                                      'Enter one of your emergency recovery codes.',
                                  )
                                : t(
                                      'auth.enter_totp_code',
                                      'Enter the code from your authenticator app.',
                                  )}
                        </p>

                        {errorMessage && (
                            <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 flex gap-2 rounded-xl border p-4 text-sm">
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handle2faSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="two-factor-code"
                                    className="mb-1 block text-sm font-medium"
                                >
                                    {useRecoveryCode
                                        ? t(
                                              'auth.recovery_code',
                                              'Recovery Code',
                                          )
                                        : t(
                                              'auth.auth_code',
                                              'Authenticator Code',
                                          )}
                                </label>
                                <input
                                    id="two-factor-code"
                                    type="text"
                                    required
                                    placeholder={
                                        useRecoveryCode
                                            ? 'XXXXX-XXXXX'
                                            : '000000'
                                    }
                                    value={twoFactorCode}
                                    onChange={(e) =>
                                        setTwoFactorCode(e.target.value)
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2.5 text-center font-mono text-lg text-sm tracking-widest focus:ring-2 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isVerifyingChallenge}
                                className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                                {isVerifyingChallenge
                                    ? '…'
                                    : t('auth.verify_btn', 'Verify')}
                            </button>

                            <div className="flex flex-col gap-2 pt-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseRecoveryCode(!useRecoveryCode);
                                        setTwoFactorCode('');
                                    }}
                                    className="text-primary text-xs font-medium hover:underline"
                                >
                                    {useRecoveryCode
                                        ? t(
                                              'auth.use_authenticator',
                                              'Use authenticator code instead',
                                          )
                                        : t(
                                              'auth.use_recovery',
                                              'Use emergency recovery code',
                                          )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(
                                            loginMethod === 'password'
                                                ? 'password'
                                                : 'otp-email',
                                        );
                                        setTwoFactorCode('');
                                        setChallengeToken(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground mt-2 flex items-center justify-center gap-1 text-xs"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    {t('common.back_to_login', 'Back to Login')}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h1 className="mb-2 text-center text-3xl font-bold">
                            {t('auth.login_title', 'Sign In')}
                        </h1>
                        <p className="text-muted-foreground mb-6 text-center text-sm">
                            {t(
                                'auth.welcome_back',
                                'Welcome back! Enter your details to continue.',
                            )}
                        </p>

                        {/* Login Method Tabs */}
                        <div className="bg-muted mb-6 flex rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginMethod('password');
                                    setStep('password');
                                    setLocalError(null);
                                }}
                                className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-all ${
                                    loginMethod === 'password'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t('auth.password_login', 'Password')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginMethod('otp');
                                    setStep(otpSent ? 'otp-code' : 'otp-email');
                                    setLocalError(null);
                                }}
                                className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-all ${
                                    loginMethod === 'otp'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t('auth.otp_login', 'OTP Email')}
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 flex gap-2 rounded-xl border p-4 text-sm">
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {step === 'password' && (
                            <form
                                onSubmit={handlePasswordSubmit}
                                noValidate
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        {t('auth.email', 'Email address')}
                                    </label>
                                    <div className="relative">
                                        <Mail className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="border-input bg-background focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            {t('auth.password', 'Password')}
                                        </label>
                                        <Link
                                            href={lp('/forgot-password')}
                                            className="text-muted-foreground hover:text-foreground text-xs"
                                        >
                                            {t(
                                                'auth.forgot_password',
                                                'Forgot password?',
                                            )}
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="••••••••"
                                            className="border-input bg-background focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <TurnstileWidget
                                    onVerify={setTurnstileToken}
                                    onExpire={() => setTurnstileToken('')}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                    {isLoggingIn
                                        ? '…'
                                        : t('auth.login_btn', 'Sign In')}
                                </button>
                            </form>
                        )}

                        {step === 'otp-email' && (
                            <form
                                onSubmit={handleSendOtp}
                                noValidate
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="otp-email-input"
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        {t('auth.email', 'Email address')}
                                    </label>
                                    <div className="relative">
                                        <Mail className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                                        <input
                                            id="otp-email-input"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="border-input bg-background focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sendingOtp || !email}
                                    className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                    {sendingOtp
                                        ? '…'
                                        : t(
                                              'auth.send_otp_code',
                                              'Send Verification Code',
                                          )}
                                </button>
                            </form>
                        )}

                        {step === 'otp-code' && (
                            <form
                                onSubmit={handleVerifyOtp}
                                className="space-y-4"
                            >
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label
                                            htmlFor="otp-code-input"
                                            className="text-sm font-medium"
                                        >
                                            {t(
                                                'auth.verify_code_label',
                                                'Enter 6-digit Code',
                                            )}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setStep('otp-email')}
                                            className="text-primary text-xs hover:underline"
                                        >
                                            {t(
                                                'auth.change_email',
                                                'Change email',
                                            )}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Key className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                                        <input
                                            id="otp-code-input"
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) =>
                                                setOtpCode(e.target.value)
                                            }
                                            placeholder="000000"
                                            className="border-input bg-background focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-center font-mono text-lg text-sm tracking-widest focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        isVerifyingOtp || otpCode.length !== 6
                                    }
                                    className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                    {isVerifyingOtp
                                        ? '…'
                                        : t(
                                              'auth.otp_verify_btn',
                                              'Verify & Sign In',
                                          )}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        disabled={otpCooldown > 0 || sendingOtp}
                                        onClick={handleSendOtp}
                                        className="text-muted-foreground hover:text-foreground text-xs font-medium disabled:opacity-50"
                                    >
                                        {otpCooldown > 0
                                            ? `${t('auth.resend_code_in', 'Resend code in')} ${otpCooldown}s`
                                            : t(
                                                  'auth.resend_code',
                                                  'Resend verification code',
                                              )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="bg-border h-px flex-1" />
                            <span className="text-muted-foreground text-xs">
                                {t('auth.or', 'or')}
                            </span>
                            <div className="bg-border h-px flex-1" />
                        </div>

                        {/* Passkey Button */}
                        <button
                            type="button"
                            onClick={handlePasskeyLogin}
                            disabled={isVerifyingPasskey}
                            className="border-input hover:bg-accent text-card-foreground flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            <Fingerprint className="text-primary h-5 w-5" />
                            <span>
                                {isVerifyingPasskey
                                    ? '…'
                                    : t(
                                          'auth.login_with_passkey',
                                          'Sign In with Passkey',
                                      )}
                            </span>
                        </button>

                        <div className="my-4" />

                        <SocialLoginButtons />

                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            {t('auth.no_account', "Don't have an account?")}{' '}
                            <Link
                                href={lp('/register')}
                                className="hover:text-foreground font-medium underline"
                            >
                                {t('auth.sign_up', 'Sign up')}
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
