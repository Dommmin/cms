export type TableOfContentsItem = {
    id: string;
    text: string;
    level: 2 | 3;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function enrichArticleHtml(html: string): {
    html: string;
    toc: TableOfContentsItem[];
} {
    const seen = new Map<string, number>();
    const toc: TableOfContentsItem[] = [];
    const bodyHtml = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gis, '<h2$1>$2</h2>');
    const enrichedHtml = bodyHtml.replace(
        /<h([23])([^>]*)>(.*?)<\/h\1>/gis,
        (match, level: string, attributes: string, innerHtml: string) => {
            const text = innerHtml.replace(/<[^>]+>/g, '').trim();

            if (text === '') {
                return match;
            }

            const baseId = slugify(text) || `section-${toc.length + 1}`;
            const count = seen.get(baseId) ?? 0;
            seen.set(baseId, count + 1);
            const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

            toc.push({ id, text, level: Number(level) as 2 | 3 });

            const cleanAttributes = attributes.replace(/\sid=(["']).*?\1/i, '');

            return `<h${level}${cleanAttributes} id="${id}">${innerHtml}</h${level}>`;
        },
    );

    return { html: enrichedHtml, toc };
}
