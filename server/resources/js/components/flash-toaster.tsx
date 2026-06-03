import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { FlashMessages } from './flash-toaster.types';

let isInternalToast = false;
let lastManualToastTime = 0;

const originalSuccess = toast.success;
const originalError = toast.error;

toast.success = (message, options) => {
    if (!isInternalToast) {
        lastManualToastTime = Date.now();
    }
    return originalSuccess(message, options);
};

toast.error = (message, options) => {
    if (!isInternalToast) {
        lastManualToastTime = Date.now();
    }
    return originalError(message, options);
};

export default function FlashToaster() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    const flash = props.flash;
    const __ = useTranslation();

    useEffect(() => {
        const now = Date.now();
        const wasToastShownRecently = now - lastManualToastTime < 150;

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
