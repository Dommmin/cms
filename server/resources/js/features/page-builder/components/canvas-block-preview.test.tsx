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
    it('renders real previews for all page builder block types', () => {
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
            makeBlock('promotional_banner', {
                title: 'Limited offer',
                subtitle: 'Save today',
            }),
            makeBlock('newsletter_signup', {
                title: 'Join the list',
                subtitle: 'Monthly updates',
            }),
            makeBlock('testimonials', {
                title: 'Customers',
                items: [{ author: 'Ada', quote: 'Great service' }],
            }),
            makeBlock('accordion', {
                items: [{ content: '<p>Answer text</p>', title: 'Question' }],
            }),
            makeBlock('tabs', {
                tabs: [{ content: '<p>Tab body</p>', title: 'Overview' }],
            }),
            makeBlock('stats_counter', {
                title: 'Numbers',
                stats: [{ label: 'Orders', value: '120' }],
            }),
            makeBlock('alert_banner', {
                message: 'Important notice',
            }),
            makeBlock('pricing_cards', {
                title: 'Pricing',
                plans: [{ name: 'Starter', price: '$10' }],
            }),
            makeBlock('categories_grid', {
                title: 'Categories',
            }),
            makeBlock('two_columns', {
                left_title: 'Left side',
                left_content: '<p>Left body</p>',
                right_title: 'Right side',
                right_content: '<p>Right body</p>',
            }),
            makeBlock('three_columns', {
                column_1_title: 'First column',
                column_2_title: 'Second column',
                column_3_title: 'Third column',
            }),
            makeBlock('form_embed', {
                title: 'Contact form',
                form: { fields: [{ label: 'Email' }] },
            }),
            makeBlock('map', {
                title: 'Store map',
            }),
            makeBlock('featured_posts', {
                title: 'Latest posts',
            }),
            makeBlock('brands_slider', {
                title: 'Trusted brands',
            }),
            makeBlock('logo_cloud', {
                title: 'Partners',
            }),
            makeBlock('countdown_timer', {
                title: 'Sale ends soon',
            }),
            makeBlock('timeline', {
                title: 'Timeline',
                items: [{ date: '2026', title: 'Launch' }],
            }),
            makeBlock('team_members', {
                title: 'Team',
                members: [{ name: 'Grace', role: 'Lead' }],
            }),
            makeBlock('icon_list', {
                title: 'Benefits',
                items: [{ title: 'Fast', description: 'Ships quickly' }],
            }),
            makeBlock('steps_process', {
                title: 'Process',
                steps: [{ title: 'Plan', description: 'Define scope' }],
            }),
            makeBlock('trust_badges', {
                badges: [{ label: 'Secure checkout' }],
            }),
            makeBlock('video_embed', {
                title: 'Product video',
                url: 'https://example.com/video',
            }),
            makeBlock('custom_html', {
                html: '<strong>Custom snippet</strong>',
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
        expect(screen.getByText('Limited offer')).toBeInTheDocument();
        expect(screen.getByText('Join the list')).toBeInTheDocument();
        expect(screen.getByText('Ada')).toBeInTheDocument();
        expect(screen.getByText('Question')).toBeInTheDocument();
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Numbers')).toBeInTheDocument();
        expect(screen.getByText('Important notice')).toBeInTheDocument();
        expect(screen.getByText('Starter')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Left side')).toBeInTheDocument();
        expect(screen.getByText('Second column')).toBeInTheDocument();
        expect(screen.getByText('Contact form')).toBeInTheDocument();
        expect(screen.getByText('Store map')).toBeInTheDocument();
        expect(screen.getByText('Latest posts')).toBeInTheDocument();
        expect(screen.getByText('Trusted brands')).toBeInTheDocument();
        expect(screen.getByText('Partners')).toBeInTheDocument();
        expect(screen.getByText('Sale ends soon')).toBeInTheDocument();
        expect(screen.getByText('Launch')).toBeInTheDocument();
        expect(screen.getByText('Grace')).toBeInTheDocument();
        expect(screen.getByText('Fast')).toBeInTheDocument();
        expect(screen.getByText('Plan')).toBeInTheDocument();
        expect(screen.getByText('Secure checkout')).toBeInTheDocument();
        expect(screen.getByText('Product video')).toBeInTheDocument();
        expect(screen.getByText('Custom snippet')).toBeInTheDocument();
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
