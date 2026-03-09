import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';

export default function CodeHighlightPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return registerCodeHighlighting(editor);
    }, [editor]);

    return null;
}
