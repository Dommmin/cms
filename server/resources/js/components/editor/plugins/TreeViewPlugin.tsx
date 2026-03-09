import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView } from '@lexical/react/LexicalTreeView';
import { type JSX } from 'react';

export default function TreeViewPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    return (
        <TreeView
            viewClassName="tree-view-output block bg-black text-white p-4 font-mono text-xs mt-1 max-h-[450px] overflow-auto"
            treeTypeButtonClassName="text-white border border-white/20 px-2 py-1 text-xs rounded"
            timeTravelPanelClassName="flex gap-2 items-center p-2"
            timeTravelButtonClassName="text-white border border-white/20 px-2 py-1 text-xs rounded"
            timeTravelPanelSliderClassName="w-full"
            editor={editor}
        />
    );
}
