import Editor, { type Props as EditorProps } from './rich-text-editor/lexical/Editor';

export type RichTextEditorProps = EditorProps;

export function RichTextEditor(props: RichTextEditorProps) {
    return <Editor {...props} />;
}
