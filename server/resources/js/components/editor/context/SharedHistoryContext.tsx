import { createEmptyHistoryState } from '@lexical/history';
import { createContext, useContext, useMemo, type JSX } from 'react';
import type { ContextShape } from './SharedHistoryContext.types';

const Context = createContext<ContextShape>({});

export function SharedHistoryContext({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const historyContext = useMemo(
        () => ({ historyState: createEmptyHistoryState() }),
        [],
    );
    return (
        <Context.Provider value={historyContext}>{children}</Context.Provider>
    );
}

export function useSharedHistoryContext(): ContextShape {
    return useContext(Context);
}
