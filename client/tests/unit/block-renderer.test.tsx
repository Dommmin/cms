import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BLOCK_CONTRACT_VIOLATION_WARNING } from '@/components/page-builder/block-validation-service';
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

const blockRendererPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../components/page-builder/block-renderer.tsx',
);

describe('BlockRenderer registry-only', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not use switch-case dispatch (registry-only)', () => {
        const source = readFileSync(blockRendererPath, 'utf8');

        expect(source).not.toMatch(/\bswitch\s*\(/);
    });

    it('throws when block is missing from registry', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { BlockRenderer } =
            await import('@/components/page-builder/block-renderer');

        expect(() =>
            renderToStaticMarkup(<BlockRenderer block={missingBlock} />),
        ).toThrow(`${BLOCK_CONTRACT_VIOLATION_WARNING}: not_registered_block`);

        expect(warnSpy).toHaveBeenCalledWith(
            BLOCK_CONTRACT_VIOLATION_WARNING,
            expect.objectContaining({
                blockType: 'not_registered_block',
            }),
        );
    });
});
