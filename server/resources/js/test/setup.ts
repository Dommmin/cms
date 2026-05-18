import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            adminTranslations: {},
        },
    }),
}));
