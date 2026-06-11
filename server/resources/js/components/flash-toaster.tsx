import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import type { FlashMessages } from './flash-toaster.types';

let isInternalToast = false;
let lastManualToastTime = 0;
let lastFlashToastTime = 0;

let lastProcessedNonce: string | null | undefined = undefined;
let lastProcessedSuccess: string | null | undefined = undefined;
let lastProcessedError: string | null | undefined = undefined;

const BACKEND_TRANSLATIONS: Record<string, Record<string, string>> = {
    pl: {
        'Settings saved': 'Ustawienia zostały zapisane',
        'Failed to save settings': 'Nie udało się zapisać ustawień',
        'Translation created': 'Tłumaczenie zostało utworzone',
        'Translation updated': 'Tłumaczenie zostało zaktualizowane',
        'Translations synced from frontend files': 'Tłumaczenia zostały zsynchronizowane z plików',
        'Translation deleted': 'Tłumaczenie zostało usunięte',
        'Affiliate code created successfully.': 'Kod afiliacyjny został pomyślnie utworzony.',
        'Affiliate code updated successfully.': 'Kod afiliacyjny został pomyślnie zaktualizowany.',
        'Affiliate code deleted.': 'Kod afiliacyjny został usunięty.',
        'Code activated.': 'Kod został aktywowany.',
        'Code deactivated.': 'Kod został dezaktywowany.',
    },
    en: {
        'Settings saved': 'Settings saved',
        'Failed to save settings': 'Failed to save settings',
        'Translation created': 'Translation created',
        'Translation updated': 'Translation updated',
        'Translations synced from frontend files': 'Translations synced from frontend files',
        'Translation deleted': 'Translation deleted',
        'Affiliate code created successfully.': 'Affiliate code created successfully.',
        'Affiliate code updated successfully.': 'Affiliate code updated successfully.',
        'Affiliate code deleted.': 'Affiliate code deleted.',
        'Code activated.': 'Code activated.',
        'Code deactivated.': 'Code deactivated.',
    }
};

const originalSuccess = toast.success;
const originalError = toast.error;

toast.success = (message, options) => {
    const now = Date.now();
    if (isInternalToast) {
        lastFlashToastTime = now;
        return originalSuccess(message, options);
    }
    
    // Suppress manual toast if a flash toast was shown recently (within 500ms)
    if (now - lastFlashToastTime < 500) {
        return '';
    }
    
    lastManualToastTime = now;
    return originalSuccess(message, options);
};

toast.error = (message, options) => {
    const now = Date.now();
    if (isInternalToast) {
        lastFlashToastTime = now;
        return originalError(message, options);
    }
    
    // Suppress manual toast if a flash toast was shown recently (within 500ms)
    if (now - lastFlashToastTime < 500) {
        return '';
    }
    
    lastManualToastTime = now;
    return originalError(message, options);
};

export default function FlashToaster() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    const flash = props.flash;
    const __ = useTranslation();
    const [locale] = useAdminLocale();

    useEffect(() => {
        // If we already showed this exact flash success/error/nonce, do not show it again
        if (
            flash?.nonce === lastProcessedNonce &&
            flash?.success === lastProcessedSuccess &&
            flash?.error === lastProcessedError
        ) {
            return;
        }

        const now = Date.now();
        const wasToastShownRecently = now - lastManualToastTime < 500;

        const translateMsg = (msg: string): string => {
            return BACKEND_TRANSLATIONS[locale]?.[msg] ?? __(msg, msg);
        };

        if (flash?.success) {
            if (!wasToastShownRecently) {
                isInternalToast = true;
                toast.success(translateMsg(flash.success));
                isInternalToast = false;
            }
        }

        if (flash?.error) {
            if (!wasToastShownRecently) {
                isInternalToast = true;
                toast.error(translateMsg(flash.error));
                isInternalToast = false;
            }
        }

        // Record as processed
        lastProcessedNonce = flash?.nonce;
        lastProcessedSuccess = flash?.success;
        lastProcessedError = flash?.error;
    }, [flash?.nonce, flash?.success, flash?.error, __, locale]);

    return null;
}
