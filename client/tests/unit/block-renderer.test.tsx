import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BLOCK_NOT_REGISTERED_WARNING } from '@/components/page-builder/block-registry-config';
import type { PageBlock } from '@/types/api';

vi.mock('next/dynamic', () => ({
    default: (
        _loader: unknown,
        options?: { loading?: ComponentType<Record<string, never>> },
    ) => {
        const Loading = options?.loading;

        return function DynamicMock() {
            return Loading ? <Loading /> : null;
        };
    },
}));

const missingBlock: PageBlock = {
    id: 1,
    type: 'not_registered_block' as PageBlock['type'],
    configuration: {},
    sort_order: 0,
    is_visible: true,
};

describe('BlockRenderer strict mode', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('throws when strict mode is enabled and block is missing from registry', async () => {
        vi.stubEnv('BLOCK_REGISTRY_STRICT_MODE', 'true');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { BlockRenderer } =
            await import('@/components/page-builder/block-renderer');

        expect(() =>
            renderToStaticMarkup(<BlockRenderer block={missingBlock} />),
        ).toThrow(`${BLOCK_NOT_REGISTERED_WARNING}: not_registered_block`);

        expect(warnSpy).toHaveBeenCalledWith(BLOCK_NOT_REGISTERED_WARNING, {
            blockType: 'not_registered_block',
        });
    });

    it('falls back without throwing when strict mode is disabled', async () => {
        vi.stubEnv('BLOCK_REGISTRY_STRICT_MODE', 'false');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { BlockRenderer } =
            await import('@/components/page-builder/block-renderer');

        expect(() =>
            renderToStaticMarkup(<BlockRenderer block={missingBlock} />),
        ).not.toThrow();

        expect(warnSpy).toHaveBeenCalledWith(BLOCK_NOT_REGISTERED_WARNING, {
            blockType: 'not_registered_block',
        });
    });
});
