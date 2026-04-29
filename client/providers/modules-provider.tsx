'use client';

import { createContext, useContext } from 'react';

import type { Modules } from '@/app/layout.types';

const defaultModules: Modules = {
    blog: false,
    ecommerce: false,
    newsletter: false,
    marketing: false,
};

const ModulesContext = createContext<Modules>(defaultModules);

export function ModulesProvider({
    modules,
    children,
}: {
    modules: Modules | undefined;
    children: React.ReactNode;
}) {
    return (
        <ModulesContext value={modules ?? defaultModules}>
            {children}
        </ModulesContext>
    );
}

export function useModules(): Modules {
    return useContext(ModulesContext);
}
