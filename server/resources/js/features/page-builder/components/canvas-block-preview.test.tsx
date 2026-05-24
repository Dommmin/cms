import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Block, Section } from '../types';
import { CanvasBlockPreview } from './canvas-block-preview';
import { CanvasView } from './canvas-view';

function makeBlock(type: string, configuration: Block['configuration']): Block {
    return {
        client_id: `${type}-1`,
        type,
        configuration,
        position: 0,
        is_active: true,
        relations: [],
    };
}

function makeSection(blocks: Block[]): Section {
    return {
        client_id: 'section-1',
        section_type: 'standard',
        layout: 'contained',
        variant: 'light',
        settings: { padding: 'md' },
        position: 0,
        is_active: true,
        blocks,
    };
}

describe('CanvasBlockPreview', () => {
    it('renders real previews for the primary page builder block types', () => {
        const blocks = [
            makeBlock('hero_banner', {
                title: 'Hero headline',
                subtitle: 'Hero subcopy',
            }),
            makeBlock('rich_text', {
                heading: 'Editorial heading',
                content: '<p>Long form content</p>',
            }),
            makeBlock('call_to_action', {
                title: 'Ready to start?',
                subtitle: 'Move faster',
                primary_label: 'Start now',
            }),
            makeBlock('image_gallery', { title: 'Gallery' }),
            makeBlock('featured_products', {
                title: 'Featured products',
                subtitle: 'Best picks',
            }),
        ];

        for (const block of blocks) {
            render(<CanvasBlockPreview block={block} onInlineEdit={vi.fn()} />);
        }

        expect(screen.getByText('Hero headline')).toBeInTheDocument();
        expect(screen.getByText('Editorial heading')).toBeInTheDocument();
        expect(screen.getByText('Long form content')).toBeInTheDocument();
        expect(screen.getByText('Ready to start?')).toBeInTheDocument();
        expect(screen.getByText('Start now')).toBeInTheDocument();
        expect(screen.getByText('Gallery')).toBeInTheDocument();
        expect(screen.getByText('Featured products')).toBeInTheDocument();
    });

    it('commits inline edits on blur', () => {
        const onInlineEdit = vi.fn();

        render(
            <CanvasBlockPreview
                block={makeBlock('hero_banner', { title: 'Old title' })}
                onInlineEdit={onInlineEdit}
            />,
        );

        const title = screen.getByLabelText('Edit title');
        title.textContent = 'New title';
        fireEvent.blur(title);

        expect(onInlineEdit).toHaveBeenCalledWith('title', 'New title');
    });
});

describe('CanvasView', () => {
    it('selects blocks, opens edit on double click, and forwards inline edits', () => {
        const onSelectSection = vi.fn();
        const onSelectBlock = vi.fn();
        const onEditBlock = vi.fn();
        const onInlineEdit = vi.fn();

        render(
            <CanvasView
                sections={[
                    makeSection([
                        makeBlock('call_to_action', {
                            title: 'CTA title',
                            primary_label: 'Buy now',
                        }),
                    ]),
                ]}
                activeSectionId={null}
                activeBlockId={null}
                onSelectSection={onSelectSection}
                onSelectBlock={onSelectBlock}
                onEditBlock={onEditBlock}
                onInlineEdit={onInlineEdit}
                availableSections={{
                    standard: { label: 'Standard section' },
                }}
            />,
        );

        fireEvent.click(screen.getByText('CTA title').closest('.group')!);
        expect(onSelectBlock).toHaveBeenCalledWith(0, 0);

        fireEvent.doubleClick(screen.getByText('CTA title').closest('.group')!);
        expect(onEditBlock).toHaveBeenCalledWith(0, 0);

        const label = screen.getByLabelText('Edit primary label');
        label.textContent = 'Shop now';
        fireEvent.blur(label);

        expect(onInlineEdit).toHaveBeenCalledWith(
            0,
            0,
            'primary_label',
            'Shop now',
        );
    });
});
