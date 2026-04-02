import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import { useEffect } from 'react';

export default function CodeHighlightPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return registerCodeHighlighting(editor);
    }, [editor]);

    return null;
}
