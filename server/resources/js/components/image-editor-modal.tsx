import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type AspectRatioOption = {
    label: string;
    value: string;
    ratio?: number;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1', ratio: 1 },
    { label: '4:3', value: '4:3', ratio: 4 / 3 },
    { label: '16:9', value: '16:9', ratio: 16 / 9 },
    { label: '3:2', value: '3:2', ratio: 3 / 2 },
    { label: '2:3', value: '2:3', ratio: 2 / 3 },
    { label: '9:16', value: '9:16', ratio: 9 / 16 },
];

type FocalPoint = {
    x: number;
    y: number;
};

type CropResult = {
    id: number;
    url: string;
    width: number;
    height: number;
    crop_of: number;
    crop_params: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotate: number;
        zoom: number;
        aspect_ratio: string;
        variant: string;
    };
    crop_variant: string;
    focal_point: FocalPoint | null;
};

type ImageEditorModalProps = {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    mediaId: number;
    onCropComplete: (result: CropResult) => void;
};

export function ImageEditorModal({
    open,
    onClose,
    imageUrl,
    mediaId,
    onCropComplete,
}: ImageEditorModalProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspectRatio, setAspectRatio] = useState<string>('free');
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [focalPoint, setFocalPoint] = useState<FocalPoint | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAspectRatioChange = useCallback((value: string) => {
        setAspectRatio(value);
        const option = ASPECT_RATIOS.find((r) => r.value === value);
        setCrop(undefined);
        if (option?.ratio) {
            setCrop({
                unit: '%',
                width: 80,
                height: 80 / option.ratio,
                x: 10,
                y: 10,
            });
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!completedCrop) return;
        const image = imageRef.current;
        if (!image) return;

        const scaleX = image.naturalWidth / image.getBoundingClientRect().width;
        const scaleY =
            image.naturalHeight / image.getBoundingClientRect().height;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('x', String(Math.round(completedCrop.x * scaleX)));
            formData.append('y', String(Math.round(completedCrop.y * scaleY)));
            formData.append(
                'width',
                String(Math.round(completedCrop.width * scaleX)),
            );
            formData.append(
                'height',
                String(Math.round(completedCrop.height * scaleY)),
            );
            formData.append('zoom', String(zoom));
            formData.append('rotate', String(rotation));
            formData.append('aspect_ratio', aspectRatio);
            if (focalPoint) {
                formData.append('focal_point[x]', String(focalPoint.x));
                formData.append('focal_point[y]', String(focalPoint.y));
            }

            const response = await fetch(MediaController.crop.url(mediaId), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Crop failed');
            }

            const result = await response.json();
            onCropComplete(result);
            onClose();
        } catch (error) {
            console.error('Crop error:', error);
        } finally {
            setIsSaving(false);
        }
    }, [
        completedCrop,
        rotation,
        zoom,
        aspectRatio,
        focalPoint,
        mediaId,
        onCropComplete,
        onClose,
    ]);

    const handleImageClick = useCallback(
        (e: React.MouseEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            const rect = img.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
            setFocalPoint({ x, y });
        },
        [],
    );

    const aspectRatioNumber =
        ASPECT_RATIOS.find((r) => r.value === aspectRatio)?.ratio ?? undefined;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Image</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1.5">
                            <Label>Aspect Ratio</Label>
                            <Select
                                value={aspectRatio}
                                onValueChange={handleAspectRatioChange}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASPECT_RATIOS.map((r) => (
                                        <SelectItem
                                            key={r.value}
                                            value={r.value}
                                        >
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-56 space-y-1.5">
                            <Label htmlFor="image-zoom">
                                Zoom: {zoom.toFixed(1)}x
                            </Label>
                            <input
                                id="image-zoom"
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(event) =>
                                    setZoom(Number(event.target.value))
                                }
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Rotation: {rotation}°</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded border px-2 py-1 text-sm hover:bg-accent"
                                    onClick={() =>
                                        setRotation((r) => (r + 90) % 360)
                                    }
                                >
                                    ↻ 90°
                                </button>
                                <button
                                    type="button"
                                    className="rounded border px-2 py-1 text-sm hover:bg-accent"
                                    onClick={() =>
                                        setRotation((r) => (r - 90 + 360) % 360)
                                    }
                                >
                                    ↺ -90°
                                </button>
                                <button
                                    type="button"
                                    className="rounded border px-2 py-1 text-sm hover:bg-accent"
                                    onClick={() => setRotation(0)}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-auto rounded-lg border bg-muted/30">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatioNumber}
                            ruleOfThirds
                        >
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Edit"
                                style={{
                                    maxWidth: '100%',
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    transformOrigin: 'center',
                                }}
                                onClick={handleImageClick}
                                crossOrigin="anonymous"
                            />
                        </ReactCrop>
                    </div>

                    {focalPoint && (
                        <div className="text-xs text-muted-foreground">
                            Focal point: {focalPoint.x}%, {focalPoint.y}%{' '}
                            <button
                                type="button"
                                className="underline"
                                onClick={() => setFocalPoint(null)}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                    {!focalPoint && (
                        <p className="text-xs text-muted-foreground">
                            Click the image to set a focal point for responsive
                            crops.
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            onClick={handleSave}
                            disabled={!completedCrop || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
