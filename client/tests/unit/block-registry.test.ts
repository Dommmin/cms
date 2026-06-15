import { describe, expect, it } from 'vitest';

import { blockRegistry } from '@/components/page-builder/block-registry';
import { PageBlockTypeEnum } from '@/components/page-builder/page-block-type-enum';

describe('blockRegistry', () => {
    it('registers every PageBlockTypeEnum value', () => {
        for (const type of Object.values(PageBlockTypeEnum)) {
            expect(
                blockRegistry[type],
                `missing registry entry for ${type}`,
            ).toBeDefined();
        }
    });
});
