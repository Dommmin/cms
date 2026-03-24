import Editor from './rich-text-editor/lexical/Editor';
import type { RichTextEditorProps } from './rich-text-editor.types';

export function RichTextEditor(props: RichTextEditorProps) {
    return <Editor {...props} />;
}
