import type { ActiveTheme } from '@/app/layout.types';

import { buildThemeCss } from '@/lib/build-theme-css';

export function ThemeStyles({ theme }: { theme: ActiveTheme | null }) {
    if (!theme) {
        return null;
    }

    const { root, dark } = buildThemeCss(theme);
    if (!root && !dark) {
        return null;
    }

    const cssBlocks: string[] = [];
    if (root) {
        cssBlocks.push(`:root { ${root} }`);
    }
    if (dark) {
        cssBlocks.push(`.dark { ${dark} }`);
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: cssBlocks.join(' '),
            }}
        />
    );
}
