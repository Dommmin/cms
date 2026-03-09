import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, type LexicalEditor } from 'lexical';

export function exportEditorStateToJSON(editor: LexicalEditor): string {
    return JSON.stringify(editor.getEditorState().toJSON());
}

export function exportEditorStateToHTML(editor: LexicalEditor): string {
    let html = '';
    editor.read(() => {
        html = $generateHtmlFromNodes(editor);
    });
    return html;
}

export function importHTMLToEditor(editor: LexicalEditor, html: string): void {
    editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().select();
        $insertNodes(nodes);
    });
}
