import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { nodes } from '../../nodes';
import { CODE_LANGUAGES } from './constants';
import ToolbarPlugin from './index';

function renderToolbar(mode: 'simple' | 'full') {
    return render(
        <LexicalComposer
            initialConfig={{
                namespace: `ToolbarPlugin-${mode}`,
                nodes,
                onError(error) {
                    throw error;
                },
            }}
        >
            <ToolbarPlugin mode={mode} />
        </LexicalComposer>,
    );
}

describe('ToolbarPlugin', () => {
    it('offers PHP and C# code block languages', () => {
        expect(CODE_LANGUAGES).toEqual(expect.arrayContaining([
            ['php', 'PHP'],
            ['csharp', 'C#'],
        ]));
    });

    it('hides advanced controls in simple mode', () => {
        renderToolbar('simple');

        expect(screen.getByRole('toolbar', { name: 'Editor toolbar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Bold (Ctrl+B)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Italic (Ctrl+I)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Insert link' })).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: 'Inline code' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Clear formatting' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Spellcheck' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Align center' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Insert' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Font size' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Font family' })).not.toBeInTheDocument();
    });

    it('shows advanced controls in full mode', () => {
        renderToolbar('full');

        expect(screen.getByRole('button', { name: 'Inline code' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear formatting' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Spellcheck' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Align center' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Font size' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Font family' })).toBeInTheDocument();
    });
});
