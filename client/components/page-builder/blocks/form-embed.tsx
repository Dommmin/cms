'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { submitForm } from '@/api/forms';
import { TurnstileWidget } from '@/components/turnstile-widget';
import type { FormField } from '@/types/api';
import type { FormEmbedConfig, FormEmbedProps } from './form-embed.types';

function FieldInput({ field }: { field: FormField }) {
    const base =
        'w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring';

    if (field.type === 'textarea') {
        return (
            <textarea
                name={field.name}
                required={field.is_required}
                placeholder={field.placeholder ?? undefined}
                rows={4}
                className={base}
            />
        );
    }

    if (field.type === 'select' && field.options) {
        return (
            <select
                name={field.name}
                required={field.is_required}
                className={base}
            >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    name={field.name}
                    required={field.is_required}
                    className="border-input h-4 w-4 rounded"
                />
                {field.label}
            </label>
        );
    }

    if (field.type === 'radio' && field.options) {
        return (
            <div className="flex flex-col gap-2">
                {field.options.map((opt) => (
                    <label
                        key={opt}
                        className="flex items-center gap-2 text-sm"
                    >
                        <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            required={field.is_required}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        );
    }

    return (
        <input
            type={field.type}
            name={field.name}
            required={field.is_required}
            placeholder={field.placeholder ?? undefined}
            className={base}
        />
    );
}

export function FormEmbedBlock({ block }: FormEmbedProps) {
    const cfg = block.configuration as FormEmbedConfig;
    const form = cfg.form;
    const [turnstileToken, setTurnstileToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!form) {
        return (
            <div className="border-border bg-muted text-muted-foreground rounded-xl border p-6 text-center">
                No form configured.
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const fields: Record<string, unknown> = {};
        formData.forEach((value, key) => {
            fields[key] = value;
        });
        const payload: Record<string, unknown> = { fields };
        if (turnstileToken) {
            payload.cf_turnstile_response = turnstileToken;
        }
        try {
            await submitForm(form!.id, payload);
            setDone(true);
            toast.success(form!.success_message ?? 'Your message was sent!');
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className="border-border bg-muted flex flex-col items-center gap-3 rounded-xl border p-8 text-center">
                <div className="text-4xl">✅</div>
                <p className="font-semibold">
                    {form.success_message ?? 'Thank you!'}
                </p>
            </div>
        );
    }

    const sortedFields = [...form.fields].sort(
        (a, b) => a.position - b.position,
    );

    return (
        <div className="flex flex-col gap-6">
            {(cfg.title || cfg.subtitle) && (
                <div>
                    {cfg.title && (
                        <h2 className="text-2xl font-bold">{cfg.title}</h2>
                    )}
                    {cfg.subtitle && (
                        <p className="text-muted-foreground mt-1">
                            {cfg.subtitle}
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {sortedFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                        {field.type !== 'checkbox' && (
                            <label className="text-sm font-medium">
                                {field.label}
                                {field.is_required && (
                                    <span className="text-destructive ml-1">
                                        *
                                    </span>
                                )}
                            </label>
                        )}
                        <FieldInput field={field} />
                    </div>
                ))}

                <TurnstileWidget
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken('')}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 self-start rounded-lg px-8 py-3 font-semibold transition-colors disabled:opacity-60"
                >
                    {loading ? 'Sending…' : 'Submit'}
                </button>
            </form>
        </div>
    );
}
