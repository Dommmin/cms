import type { EditorThemeClasses } from 'lexical';

export const theme: EditorThemeClasses = {
    paragraph: 'editor-paragraph',
    heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
    },
    list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'editor-list-item',
        nested: {
            listitem: 'editor-list-item-nested',
        },
    },
    link: 'editor-link',
    text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
    },
    code: 'editor-code',
    table: 'editor-table',
    tableCell: 'editor-table-cell',
    tableCellHeader: 'editor-table-cell-header',
    tableRow: 'editor-table-row',
};
