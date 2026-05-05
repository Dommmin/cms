import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { FlashMessages } from './flash-toaster.types';

export default function FlashToaster() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    const flash = props.flash;
    const __ = useTranslation();

    useEffect(() => {
        if (flash?.success) {
            toast.success(__(flash.success, flash.success));
        }

        if (flash?.error) {
            toast.error(__(flash.error, flash.error));
        }
    }, [flash?.nonce, flash?.success, flash?.error, __]);

    return null;
}
