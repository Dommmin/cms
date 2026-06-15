import { describe, expect, it, vi } from 'vitest';

import {
    BLOCK_CONTRACT_VIOLATION_WARNING,
    validateBlockContract,
} from '@/components/page-builder/block-validation-service';
import { PageBlockTypeEnum } from '@/components/page-builder/page-block-type-enum';

describe('validateBlockContract', () => {
    it('accepts every registered block type contract', () => {
        for (const type of Object.values(PageBlockTypeEnum)) {
            const result = validateBlockContract(type);

            expect(result.valid, result.errors.join('; ')).toBe(true);
        }
    });

    it('rejects unknown block types', () => {
        const result = validateBlockContract('not_registered_block');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
            'Block type [not_registered_block] is not registered in contract.',
        );
    });
});

describe('usePreRenderBlockValidation', () => {
    it('throws when contract validation fails', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { usePreRenderBlockValidation } =
            await import('@/components/page-builder/use-pre-render-block-validation');

        expect(() =>
            usePreRenderBlockValidation('not_registered_block' as never),
        ).toThrow(BLOCK_CONTRACT_VIOLATION_WARNING);

        expect(warnSpy).toHaveBeenCalled();
    });
});
