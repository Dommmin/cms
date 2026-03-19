import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : (url?.url ?? '');
}

export function ucfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/** Format an ISO date string as pl-PL date + time (e.g. "19 mar 2026, 14:30"). */
export function formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleString('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}
