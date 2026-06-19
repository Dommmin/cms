'use client';

import { PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { BlockHeader } from '@/components/composition';
import { subscribeToNewsletter } from '@/components/page-builder/mutations/newsletter';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    NewsletterSignupConfig,
    NewsletterSignupProps,
} from './newsletter-signup.types';

export function NewsletterSignupBlock({ block }: NewsletterSignupProps) {
    const cfg = block.configuration as NewsletterSignupConfig;
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await subscribeToNewsletter({
                email,
                name: cfg.ask_name ? name : undefined,
                cf_turnstile_response: turnstileToken || undefined,
            });
            setDone(true);
            toast.success(cfg.success_message ?? 'Thanks for subscribing!');
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                    <PartyPopper className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-[length:var(--h4-size,1.25rem)] font-semibold">
                    {cfg.success_message ?? "You're subscribed!"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <BlockHeader
                title={cfg.title}
                description={cfg.subtitle}
                align="center"
                descriptionClassName="max-w-xl"
            />

            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-3"
            >
                {cfg.ask_name ? (
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={cfg.placeholder ?? 'Enter your email'}
                        className="min-w-0 flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? '...' : (cfg.button_text ?? 'Subscribe')}
                    </Button>
                </div>
                <TurnstileWidget
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken('')}
                />
            </form>
        </div>
    );
}
