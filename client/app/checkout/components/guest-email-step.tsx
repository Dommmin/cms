'use client';

import { sendOtp, verifyOtp } from '@/api/auth';
import { useTranslation } from '@/hooks/use-translation';
import { setToken } from '@/lib/axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { GuestEmailStepProps } from '../checkout.types';

export function GuestEmailStep({
    guestEmail,
    submitAttempted,
    onGuestEmailChange,
    onLoginSuccess,
}: GuestEmailStepProps) {
    const { t } = useTranslation();
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
    const [otpEmail, setOtpEmail] = useState(guestEmail);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Keep otpEmail in sync with guestEmail initially, or vice-versa
    useEffect(() => {
        if (!isOtpMode) {
            setOtpEmail(guestEmail);
        }
    }, [guestEmail, isOtpMode]);

    // Cooldown timer for resending OTP
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!otpEmail.trim() || !otpEmail.includes('@')) {
            toast.error(
                t('auth.invalid_email', 'Please enter a valid email address.'),
            );
            return;
        }

        setIsLoading(true);
        try {
            await sendOtp(otpEmail);
            toast.success(
                t('auth.otp_sent', 'Verification code sent to your email.'),
            );
            setOtpStep('code');
            setCooldown(30);
            setCode('');
        } catch (err: unknown) {
            const axiosError = err as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };
            const msg =
                axiosError.response?.data?.message ||
                t('auth.otp_send_failed', 'Failed to send verification code.');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            toast.error(
                t('auth.invalid_code_length', 'Please enter the 6-digit code.'),
            );
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyOtp({ email: otpEmail, code });
            setToken(response.token!);
            toast.success(t('auth.login_success', 'Successfully logged in!'));
            onLoginSuccess(response.token!);
        } catch (err: unknown) {
            const axiosError = err as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };
            const msg =
                axiosError.response?.data?.message ||
                t('auth.otp_verify_failed', 'Invalid or expired code.');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const showError = submitAttempted && !guestEmail.trim() && !isOtpMode;

    if (isOtpMode) {
        return (
            <div className="border-border bg-card/60 relative overflow-hidden rounded-xl border p-5 shadow-md transition-all duration-300">
                <div className="from-primary/30 via-primary to-primary/30 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r" />

                {otpStep === 'email' ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="otp-email"
                                    className="text-sm font-semibold"
                                >
                                    {t(
                                        'checkout.otp_login_title',
                                        'Log in / Register with OTP',
                                    )}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsOtpMode(false)}
                                    className="text-primary text-xs font-medium hover:underline"
                                >
                                    {t('checkout.buy_as_guest', 'Buy as guest')}
                                </button>
                            </div>
                            <p className="text-muted-foreground mb-3 text-xs">
                                {t(
                                    'checkout.otp_email_hint',
                                    'Enter your email. We will send you a one-time verification code to log in or create an account instantly.',
                                )}
                            </p>
                            <input
                                id="otp-email"
                                type="email"
                                value={otpEmail}
                                onChange={(e) => {
                                    setOtpEmail(e.target.value);
                                    onGuestEmailChange(e.target.value);
                                }}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-60"
                            />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={isLoading || !otpEmail}
                                className="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : null}
                                {t('checkout.send_code', 'Send Code')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="otp-code"
                                    className="text-sm font-semibold"
                                >
                                    {t(
                                        'checkout.verify_otp_title',
                                        'Enter Verification Code',
                                    )}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpStep('email');
                                        setCode('');
                                    }}
                                    disabled={isLoading}
                                    className="text-primary text-xs font-medium hover:underline disabled:opacity-50"
                                >
                                    {t('checkout.change_email', 'Change email')}
                                </button>
                            </div>
                            <p className="text-muted-foreground mb-3 text-xs">
                                {t(
                                    'checkout.otp_code_hint',
                                    'We sent a 6-digit verification code to {email}. Please enter it below.',
                                ).replace('{email}', otpEmail)}
                            </p>
                            <input
                                id="otp-code"
                                type="text"
                                maxLength={6}
                                pattern="\d{6}"
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value.replace(/\D/g, ''))
                                }
                                placeholder="000000"
                                required
                                disabled={isLoading}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-3 text-center font-mono text-lg tracking-[0.5em] focus:ring-2 focus:outline-none disabled:opacity-60"
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={isLoading || code.length !== 6}
                                className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : null}
                                {t(
                                    'checkout.verify_and_login',
                                    'Verify & Log In',
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCode()}
                                disabled={isLoading || cooldown > 0}
                                className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground py-1 text-xs font-medium transition disabled:opacity-50"
                            >
                                {cooldown > 0
                                    ? `${t('checkout.resend_code_cooldown', 'Resend code in')} ${cooldown}s`
                                    : t('checkout.resend_code', 'Resend code')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="border-border relative rounded-xl border p-5">
            <div className="mb-3 flex items-center justify-between">
                <label htmlFor="guest-email" className="text-sm font-semibold">
                    {t('checkout.guest_email_title', 'Your Email Address')}
                </label>
                <button
                    type="button"
                    onClick={() => setIsOtpMode(true)}
                    className="text-primary text-xs font-medium hover:underline"
                >
                    {t('checkout.login_with_otp', 'Zaloguj kodem OTP')}
                </button>
            </div>
            <p
                className="text-muted-foreground mb-3 text-xs"
                id="guest-email-hint"
            >
                {t(
                    'checkout.guest_email_hint',
                    "We'll send your order confirmation here.",
                )}
            </p>
            <input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
                placeholder="you@example.com"
                required
                aria-describedby={
                    showError
                        ? 'guest-email-hint guest-email-error'
                        : 'guest-email-hint'
                }
                aria-invalid={showError}
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            {showError && (
                <p
                    id="guest-email-error"
                    role="alert"
                    className="text-destructive mt-1 text-xs"
                >
                    {t(
                        'checkout.guest_email_required',
                        'Email address is required.',
                    )}
                </p>
            )}
        </div>
    );
}
