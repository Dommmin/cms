import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    nonce?: string | null;
};

export default function FlashToaster() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    const flash = props.flash;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.nonce, flash?.success, flash?.error]);

    return null;
}
