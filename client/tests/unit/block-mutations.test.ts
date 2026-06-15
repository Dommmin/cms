import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const blocksDir = join(process.cwd(), 'components/page-builder/blocks');

describe('page builder block mutations', () => {
    it('newsletter-signup does not import @/api/newsletter directly', () => {
        const source = readFileSync(
            join(blocksDir, 'newsletter-signup.tsx'),
            'utf8',
        );

        expect(source).not.toMatch(/@\/api\/newsletter/);
        expect(source).toContain(
            '@/components/page-builder/mutations/newsletter',
        );
    });

    it('form-embed does not import @/api/forms directly', () => {
        const source = readFileSync(join(blocksDir, 'form-embed.tsx'), 'utf8');

        expect(source).not.toMatch(/@\/api\/forms/);
        expect(source).toContain('@/components/page-builder/mutations/forms');
    });
});
