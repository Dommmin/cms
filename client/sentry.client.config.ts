import * as Sentry from '@sentry/nextjs';

const glitchtipDsn =
    process.env.NEXT_PUBLIC_GLITCHTIP_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (glitchtipDsn) {
    Sentry.init({
        dsn: glitchtipDsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],
    });
}
