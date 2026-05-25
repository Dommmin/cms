import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPickerModal } from './media-picker-modal';
import type {
    MediaData,
    MediaItem,
    SelectedImage,
} from './media-picker-modal.types';

vi.mock('axios');

vi.mock('@/actions/App/Http/Controllers/Admin/MediaController', () => ({
    search: { url: () => '/admin/media/search' },
    upload: { url: () => '/admin/media/upload' },
}));

const mediaItems: MediaItem[] = [
    {
        id: 1,
        name: 'Hero image',
        file_name: 'hero.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        url: '/storage/hero.jpg',
        alt: 'Hero alt',
        caption: 'Hero caption',
        created_at: '2026-05-18T10:00:00.000000Z',
    },
    {
        id: 2,
        name: 'Manual PDF',
        file_name: 'manual.pdf',
        mime_type: 'application/pdf',
        size: 2048,
        url: '/storage/manual.pdf',
        created_at: '2026-05-18T10:00:00.000000Z',
    },
    {
        id: 3,
        name: 'Demo video',
        file_name: 'demo.mp4',
        mime_type: 'video/mp4',
        size: 4096,
        url: '/storage/demo.mp4',
        created_at: '2026-05-18T10:00:00.000000Z',
    },
];

function mediaResponse(items: MediaItem[]): MediaData {
    return {
        data: items,
        prev_page_url: null,
        next_page_url: null,
        current_page: 1,
        last_page: 1,
        per_page: 40,
        total: items.length,
    };
}

function renderPicker(
    props: Partial<React.ComponentProps<typeof MediaPickerModal>> = {},
) {
    return render(
        <MediaPickerModal
            open
            onClose={vi.fn()}
            onSelect={vi.fn()}
            selectedImages={[]}
            {...props}
        />,
    );
}

describe('MediaPickerModal', () => {
    beforeEach(() => {
        vi.mocked(axios.get).mockResolvedValue({
            data: mediaResponse(mediaItems),
        });
    });

    it('shows only image assets in image mode', async () => {
        renderPicker({ mode: 'image' });

        expect(await screen.findByAltText('Hero image')).toBeInTheDocument();
        expect(screen.queryByText('Manual PDF')).not.toBeInTheDocument();
        expect(screen.queryByText('Demo video')).not.toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('mime_types%5B%5D=image%2F*'),
        );
    });

    it('allows gallery mode to select multiple images and reorder the selected rail', async () => {
        const onSelect = vi.fn();
        const onReorder = vi.fn();
        const selectedImages: SelectedImage[] = [
            {
                id: 4,
                url: '/storage/first.jpg',
                name: 'First image',
                mime_type: 'image/jpeg',
                is_thumbnail: false,
            },
            {
                id: 5,
                url: '/storage/second.jpg',
                name: 'Second image',
                mime_type: 'image/jpeg',
                is_thumbnail: false,
            },
        ];

        renderPicker({
            mode: 'gallery',
            onSelect,
            onReorder,
            selectedImages,
        });

        fireEvent.click(await screen.findByAltText('Hero image'));
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
        );
        expect(screen.getByText('Selected (2)')).toBeInTheDocument();

        const firstRow = screen
            .getByText('First image')
            .closest('[draggable="true"]');
        const secondRow = screen
            .getByText('Second image')
            .closest('[draggable="true"]');

        expect(firstRow).not.toBeNull();
        expect(secondRow).not.toBeNull();

        fireEvent.dragStart(firstRow as HTMLElement);
        fireEvent.dragOver(secondRow as HTMLElement);

        await waitFor(() => {
            expect(onReorder).toHaveBeenCalledWith([
                expect.objectContaining({ id: 5 }),
                expect.objectContaining({ id: 4 }),
            ]);
        });
    });

    it('shows document assets and hides images in file mode', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        renderPicker({ mode: 'file', onSelect });

        expect(await screen.findByText('Manual PDF')).toBeInTheDocument();
        expect(screen.queryByAltText('Hero image')).not.toBeInTheDocument();

        await user.click(
            screen.getByText('Manual PDF').closest('button') as HTMLElement,
        );

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 2 }),
        );
    });

    it('supports list view, thumbnail size, and media sort controls', async () => {
        const user = userEvent.setup();

        renderPicker({ mode: 'any' });

        expect(await screen.findByAltText('Hero image')).toBeInTheDocument();

        await user.selectOptions(
            screen.getByLabelText('Thumbnail size'),
            'medium',
        );
        expect(screen.getByLabelText('Thumbnail size')).toHaveValue('medium');
        expect(
            screen.queryByRole('option', { name: 'Large' }),
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'List view' }));
        expect(screen.getByText('hero.jpg · image/jpeg')).toBeInTheDocument();
        expect(
            screen.queryByLabelText('Thumbnail size'),
        ).not.toBeInTheDocument();

        await user.selectOptions(
            screen.getByLabelText('Sort media'),
            'name_asc',
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenLastCalledWith(
                expect.stringContaining('sort=name_asc'),
            );
        });
    });
});
