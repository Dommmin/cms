<!DOCTYPE html>
<html
    lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    data-theme-active="{{ ! empty($activeThemeSlug) ? '1' : '0' }}"
    data-theme-slug="{{ $activeThemeSlug ?? '' }}"
    @class(['dark' => ($appearance ?? 'system') == 'dark'])
>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script nonce="{{ Vite::cspNonce() }}">
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style nonce="{{ Vite::cspNonce() }}">
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            :root {
                {!! $activeThemeCssVariables ?? '' !!}
            }

            .dark {
                {!! $activeThemeDarkCssVariables ?? '' !!}
            }
        </style>

        <title data-inertia>{{ config('app.name', 'Laravel') }}</title>

        @auth
            <link rel="manifest" href="/manifest.json">
            <meta name="theme-color" content="#09090b">
        @endauth

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

        @auth
            {{-- Register PWA Service Worker --}}
            <script nonce="{{ Vite::cspNonce() }}">
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js')
                            .then(reg => console.log('ServiceWorker registered:', reg.scope))
                            .catch(err => console.log('ServiceWorker registration failed:', err));
                    });
                }
            </script>
        @endauth
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
