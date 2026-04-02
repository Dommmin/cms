import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import '../css/app.css';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

initializeTheme();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    strictMode: true,

    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster position="bottom-right" />
            </TooltipProvider>
        );
    },

    progress: {
        color: '#4B5563',
    },
});
