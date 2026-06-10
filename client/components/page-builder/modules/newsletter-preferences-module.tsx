'use client';

import {
    getNewsletterPreferences,
    updateNewsletterPreferences,
} from '@/api/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NewsletterPreferences, Page } from '@/types/api';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Mail,
    Save,
    Settings,
    UserMinus,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NewsletterPreferencesModuleProps {
    page: Page;
    searchParams?: { [key: string]: string | string[] | undefined };
}

export function NewsletterPreferencesModule({
    page,
    searchParams,
}: NewsletterPreferencesModuleProps) {
    const rawToken = searchParams?.token;
    const initialToken = typeof rawToken === 'string' ? rawToken : '';

    const [token, setToken] = useState(initialToken);
    const [preferences, setPreferences] =
        useState<NewsletterPreferences | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Form states
    const [firstName, setFirstName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedSegments, setSelectedSegments] = useState<number[]>([]);

    async function loadPreferences(activeToken: string) {
        if (!activeToken) return;
        setLoading(true);
        setError(null);
        setSaveMessage(null);

        try {
            const data = await getNewsletterPreferences(activeToken);
            setPreferences(data);
            setFirstName(data.first_name || '');
            setIsActive(data.is_active);
            setSelectedSegments(data.active_segments || []);
        } catch (err) {
            console.error('Failed to load newsletter preferences:', err);
            setPreferences(null);
            if (isAxiosError(err) && err.response?.status === 404) {
                setError(
                    'Invalid subscription token. Please verify the URL or request a new link.',
                );
            } else {
                setError('Could not retrieve preferences. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialToken) {
            loadPreferences(initialToken);
        }
    }, [initialToken]);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        setError(null);
        setSaveMessage(null);

        try {
            const response = await updateNewsletterPreferences(token, {
                first_name: firstName.trim() || null,
                is_active: isActive,
                segments: selectedSegments,
            });
            setSaveMessage(
                response.message || 'Preferences saved successfully.',
            );
            // Reload fresh preferences
            loadPreferences(token);
        } catch (err) {
            console.error('Failed to save preferences:', err);
            if (isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(
                    'Failed to update newsletter preferences. Please try again.',
                );
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleInstantUnsubscribe() {
        if (!token) return;
        setSaving(true);
        setError(null);
        setSaveMessage(null);

        try {
            const response = await updateNewsletterPreferences(token, {
                first_name: firstName.trim() || null,
                is_active: false,
                segments: [],
            });
            setSaveMessage(
                response.message ||
                    'You have been successfully unsubscribed from all emails.',
            );
            setIsActive(false);
            setSelectedSegments([]);
            loadPreferences(token);
        } catch (err) {
            console.error('Failed to unsubscribe:', err);
            setError(
                'Failed to unsubscribe. Please try again or contact support.',
            );
        } finally {
            setSaving(false);
        }
    }

    function toggleSegment(segmentId: number) {
        setSelectedSegments((prev) =>
            prev.includes(segmentId)
                ? prev.filter((id) => id !== segmentId)
                : [...prev, segmentId],
        );
    }

    function handleTokenSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (token.trim()) {
            loadPreferences(token.trim());
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {page.title || 'Email Subscription Center'}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                        {page.excerpt}
                    </p>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* No preferences loaded state - show token lookup */}
                {!preferences && !loading ? (
                    <motion.div
                        key="token-lookup"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-border bg-card mx-auto max-w-md space-y-6 rounded-3xl border p-8 shadow-sm"
                    >
                        <div className="text-center">
                            <Mail className="text-primary mx-auto mb-4 h-12 w-12" />
                            <h2 className="text-xl font-bold">
                                Preferences Token Required
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                To view your subscription details, please enter
                                the secure access token from the footer of your
                                emails.
                            </p>
                        </div>

                        <form
                            onSubmit={handleTokenSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="token"
                                    className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
                                >
                                    Access Token
                                </label>
                                <Input
                                    id="token"
                                    type="text"
                                    required
                                    placeholder="Enter your email token..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="text-destructive bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-xl border p-3 text-xs">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button type="submit" className="h-11 w-full">
                                Access Preferences
                            </Button>
                        </form>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        key="loading-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <Loader2 className="text-primary h-10 w-10 animate-spin" />
                        <p className="text-muted-foreground mt-4 text-sm font-medium">
                            Retrieving subscription data...
                        </p>
                    </motion.div>
                ) : (
                    /* Preferences editor */
                    <motion.div
                        key="editor-state"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Status notification banner */}
                        {saveMessage && (
                            <div className="flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                                <span>{saveMessage}</span>
                            </div>
                        )}

                        {error && (
                            <div className="text-destructive bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-2xl border p-4 text-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="border-border bg-card space-y-6 rounded-3xl border p-6 shadow-sm sm:p-8">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Settings className="text-primary h-6 w-6" />
                                <div>
                                    <h2 className="text-xl font-bold">
                                        Manage Subscriptions
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-sm">
                                        Managing settings for:{' '}
                                        <strong className="text-foreground">
                                            {preferences?.email}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                {/* First Name input */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="first_name"
                                        className="text-sm font-semibold"
                                    >
                                        First Name
                                    </label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        placeholder="e.g. John"
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Active Subscription Status (RODO toggle) */}
                                <div className="border-border bg-muted/20 flex items-center justify-between gap-4 rounded-2xl border p-4">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold">
                                            Subscription Status
                                        </h3>
                                        <p className="text-muted-foreground text-xs leading-normal">
                                            Keep this active to receive any
                                            selected emails. Unchecking it stops
                                            all marketing communications.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center select-none">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => {
                                                setIsActive(e.target.checked);
                                                if (!e.target.checked) {
                                                    // Opt-out from segments if subscription is deactivated
                                                    setSelectedSegments([]);
                                                }
                                            }}
                                            className="peer sr-only"
                                        />
                                        <div className="bg-muted-foreground/30 peer peer-checked:bg-primary h-6 w-11 rounded-full peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                                    </label>
                                </div>

                                {/* Preferences / Segments selection */}
                                {isActive &&
                                    preferences &&
                                    preferences.available_segments.length >
                                        0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3"
                                        >
                                            <label className="text-sm font-semibold">
                                                Topics of Interest
                                            </label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {preferences.available_segments.map(
                                                    (segment) => {
                                                        const isChecked =
                                                            selectedSegments.includes(
                                                                segment.id,
                                                            );
                                                        return (
                                                            <div
                                                                key={segment.id}
                                                                onClick={() =>
                                                                    toggleSegment(
                                                                        segment.id,
                                                                    )
                                                                }
                                                                className={`hover:bg-muted/10 cursor-pointer rounded-2xl border p-4 transition-all ${
                                                                    isChecked
                                                                        ? 'border-primary bg-primary/5'
                                                                        : 'border-border'
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            isChecked
                                                                        }
                                                                        readOnly
                                                                        className="border-input text-primary focus:ring-primary mt-1 rounded"
                                                                    />
                                                                    <div>
                                                                        <p className="text-sm font-semibold">
                                                                            {
                                                                                segment.name
                                                                            }
                                                                        </p>
                                                                        {segment.description && (
                                                                            <p className="text-muted-foreground mt-1 text-xs leading-normal">
                                                                                {
                                                                                    segment.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                {/* RODO / GDPR GDPR compliance hint */}
                                <div className="text-muted-foreground border-t pt-4 text-xs leading-normal">
                                    We respect your privacy. Under the EU
                                    General Data Protection Regulation
                                    (RODO/GDPR), you have the right to inspect,
                                    change, or erase your subscription status at
                                    any time. Saving settings will update our
                                    list immediately.
                                </div>

                                {/* Form actions */}
                                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
                                    <Button
                                        type="submit"
                                        className="h-11 w-full sm:w-auto"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Settings
                                    </Button>

                                    {isActive && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleInstantUnsubscribe}
                                            className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive h-11 w-full sm:w-auto"
                                            disabled={saving}
                                        >
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Unsubscribe All
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
