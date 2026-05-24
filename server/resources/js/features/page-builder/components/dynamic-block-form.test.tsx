import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Block, BlockTypeConfig } from '../types';
import { DynamicBlockForm } from './dynamic-block-form';

const block: Block = {
    client_id: 'block-1',
    type: 'call_to_action',
    configuration: {
        title: 'CTA',
        subtitle: 'Subcopy',
        columns: 3,
        custom_note: 'Hidden in simple',
    },
    position: 0,
    is_active: true,
    relations: [],
};

const blockTypeConfig: BlockTypeConfig = {
    name: 'Call to Action',
    schema: {
        type: 'object',
        properties: {
            title: { type: 'string', label: 'Title' },
            subtitle: { type: 'string', label: 'Subtitle' },
            columns: { type: 'integer', label: 'Columns' },
            custom_note: { type: 'string', label: 'Custom Note' },
        },
    },
};

function renderForm(editorMode: 'simple' | 'advanced') {
    return render(
        <DynamicBlockForm
            block={block}
            blockTypeConfig={blockTypeConfig}
            onUpdateConfig={vi.fn()}
            onUpdateRelations={vi.fn()}
            editorMode={editorMode}
        />,
    );
}

describe('DynamicBlockForm editor modes', () => {
    it('shows only basic fields in simple mode', () => {
        renderForm('simple');

        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Subtitle')).toBeInTheDocument();
        expect(screen.queryByLabelText('Columns')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Custom Note')).not.toBeInTheDocument();
    });

    it('shows all schema fields in advanced mode', () => {
        renderForm('advanced');

        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Subtitle')).toBeInTheDocument();
        expect(screen.getByLabelText('Columns')).toBeInTheDocument();
        expect(screen.getByLabelText('Custom Note')).toBeInTheDocument();
    });
});
