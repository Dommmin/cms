'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Loader2Icon, SendIcon } from 'lucide-react';
import { useState } from 'react';
import type { PreChatFormProps } from './pre-chat-form.types';

const SUBJECTS = [
    { key: 'order_question', fallback: 'Order question' },
    { key: 'product_issue', fallback: 'Product issue' },
    { key: 'return_complaint', fallback: 'Return / Complaint' },
    { key: 'shipping_question', fallback: 'Shipping question' },
    { key: 'other', fallback: 'Other' },
];

export function PreChatForm({
    isAuthenticated,
    userName,
    userEmail,
    onSubmit,
    isLoading,
}: PreChatFormProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(userName ?? '');
    const [email, setEmail] = useState(userEmail ?? '');
    const [subject, setSubject] = useState(SUBJECTS[0].key);
    const [body, setBody] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit({ name, email, subject, body });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
            <p className="text-muted-foreground text-sm">
                {t(
                    'chat.pre_chat_desc',
                    'Describe your problem — we will respond as soon as possible.',
                )}
            </p>

            {!isAuthenticated && (
                <>
                    <div>
                        <label className="mb-1 block text-xs font-medium">
                            {t('chat.name_label', 'Name *')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t(
                                'chat.name_placeholder',
                                'e.g. John Doe',
                            )}
                            required
                            className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium">
                            {t('chat.email_label', 'Email *')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                        />
                    </div>
                </>
            )}

            <div>
                <label className="mb-1 block text-xs font-medium">
                    {t('chat.subject_label', 'Subject *')}
                </label>
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                >
                    {SUBJECTS.map((s) => (
                        <option key={s.key} value={s.key}>
                            {t(`chat.subject.${s.key}`, s.fallback)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium">
                    {t('chat.message_label', 'Message *')}
                </label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t(
                        'chat.message_placeholder',
                        'Describe your problem...',
                    )}
                    required
                    rows={4}
                    className="bg-background ring-offset-background focus:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || !body.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                    <SendIcon className="h-4 w-4" />
                )}
                {t('chat.start_chat', 'Start Chat')}
            </button>
        </form>
    );
}
