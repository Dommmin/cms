'use client';

import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { BlockHeader } from '@/components/composition';
import { submitEmbeddedForm } from '@/components/page-builder/mutations/forms';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormField } from '@/types/api';
import type { FormEmbedConfig, FormEmbedProps } from './form-embed.types';

function FieldInput({ field }: { field: FormField }) {
    if (field.type === 'textarea') {
        return (
            <Textarea
                id={field.name}
                name={field.name}
                required={field.is_required}
                placeholder={field.placeholder ?? undefined}
                rows={4}
            />
        );
    }

    if (field.type === 'select' && field.options) {
        return (
            <select
                id={field.name}
                name={field.name}
                required={field.is_required}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
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
                    id={field.name}
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
        <Input
            id={field.name}
            type={field.type}
            name={field.name}
            required={field.is_required}
            placeholder={field.placeholder ?? undefined}
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
            await submitEmbeddedForm(form!.id, payload);
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
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                    <CheckCircle className="h-6 w-6" aria-hidden="true" />
                </div>
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
            <BlockHeader
                title={cfg.title}
                description={cfg.subtitle}
                size="base"
                compactDescription
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {sortedFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                        {field.type !== 'checkbox' ? (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.is_required ? (
                                    <span className="text-destructive ml-1">
                                        *
                                    </span>
                                ) : null}
                            </Label>
                        ) : null}
                        <FieldInput field={field} />
                    </div>
                ))}

                <TurnstileWidget
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken('')}
                />
                <Button type="submit" disabled={loading} className="self-start">
                    {loading ? 'Sending…' : 'Submit'}
                </Button>
            </form>
        </div>
    );
}
