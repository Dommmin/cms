'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { subscribe, unsubscribe } from '@/api/newsletter';
import type { NewsletterSubscribePayload } from '@/types/api';

export function useNewsletterSubscribe() {
    return useMutation({
        mutationFn: (payload: NewsletterSubscribePayload) => subscribe(payload),
        onSuccess: ({ message }) => toast.success(message ?? 'Subscribed!'),
    });
}

export function useNewsletterUnsubscribe() {
    return useMutation({
        mutationFn: (email: string) => unsubscribe(email),
        onSuccess: ({ message }) => toast.success(message ?? 'Unsubscribed.'),
    });
}
