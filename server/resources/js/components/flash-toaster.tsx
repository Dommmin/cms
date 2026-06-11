import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { FlashMessages } from './flash-toaster.types';

let isInternalToast = false;
let lastManualToastTime = 0;
let lastFlashToastTime = 0;

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

    useEffect(() => {
        const now = Date.now();
        const wasToastShownRecently = now - lastManualToastTime < 500;

        if (flash?.success) {
            if (!wasToastShownRecently) {
                isInternalToast = true;
                toast.success(__(flash.success, flash.success));
                isInternalToast = false;
            }
        }

        if (flash?.error) {
            if (!wasToastShownRecently) {
                isInternalToast = true;
                toast.error(__(flash.error, flash.error));
                isInternalToast = false;
            }
        }
    }, [flash?.nonce, flash?.success, flash?.error, __]);

    return null;
}
