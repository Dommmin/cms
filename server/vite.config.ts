import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: [
                'app/**/*.php',
                'routes/**/*.php',
                'resources/views/**/*.php',
                'resources/js/**/*.ts',
                'resources/js/**/*.tsx',
                'resources/css/**/*.css'
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'ws',
        },
        watch: {
            ignored: [
                '**/node_modules/**',
                '**/vendor/**',
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/.git/**',
                '**/.next/**',
                '**/.turbo/**',
                '**/coverage/**',
                '**/playwright-report/**',
                '**/test-results/**',
            ],

            usePolling: process.env.VITE_USE_POLLING === 'true',
        },
    },
});
