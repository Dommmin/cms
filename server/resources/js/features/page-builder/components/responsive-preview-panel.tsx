import {
    ExternalLink,
    Maximize2,
    Minimize2,
    Monitor,
    RefreshCw,
    Smartphone,
    Tablet,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type {
    PreviewDevice,
    PreviewDeviceOption,
    ResponsivePreviewPanelProps,
} from './responsive-preview-panel.types';

const DEVICE_OPTIONS: PreviewDeviceOption[] = [
    {
        value: 'desktop',
        label: 'Desktop',
        icon: Monitor,
        className: 'w-full',
    },
    {
        value: 'tablet',
        label: 'Tablet',
        icon: Tablet,
        className: 'w-[768px] max-w-full',
    },
    {
        value: 'mobile',
        label: 'Mobile',
        icon: Smartphone,
        className: 'w-[390px] max-w-full',
    },
];

function formatUpdatedAt(value?: Date | null): string {
    if (!value) return '';

    return value.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function ResponsivePreviewPanel({
    inspector,
    health,
    previewUrl,
    isRefreshing = false,
    isStale = false,
    updatedAt = null,
    onRefresh,
    onOpenPreview,
}: ResponsivePreviewPanelProps) {
    const __ = useTranslation();
    const [device, setDevice] = useState<PreviewDevice>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const activeDevice =
        DEVICE_OPTIONS.find((option) => option.value === device) ??
        DEVICE_OPTIONS[0];
    const previewStatus = isStale
        ? __('builder.preview_outdated', 'Outdated changes')
        : updatedAt
          ? `${__('builder.preview_current', 'Current')} ${formatUpdatedAt(updatedAt)}`
          : __('builder.preview_ready', 'Ready');

    const deviceSelector = (
        <div className="grid grid-cols-3 rounded-md border bg-muted/30 p-1">
            {DEVICE_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setDevice(option.value)}
                        className={cn(
                            'flex h-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground',
                            device === option.value &&
                                'bg-background text-foreground shadow-sm',
                        )}
                        title={option.label}
                        aria-pressed={device === option.value}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );

    const previewContent = (
        <>
            <div className="border-b px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-semibold">
                            {__(
                                'builder.responsive_preview',
                                'Preview',
                            )}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {previewStatus}
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsFullscreen(true)}
                            title={__(
                                'builder.fullscreen_preview',
                                'Fullscreen preview',
                            )}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            title={__(
                                'builder.refresh_preview',
                                'Refresh preview',
                            )}
                        >
                            <RefreshCw
                                className={cn(
                                    'h-4 w-4',
                                    isRefreshing && 'animate-spin',
                                )}
                            />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onOpenPreview}
                            title={__(
                                'builder.open_preview',
                                'Open preview',
                            )}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mt-3">{deviceSelector}</div>
            </div>

            <div className="h-[calc(100vh-19.5rem)] overflow-auto bg-muted/40 p-3">
                <div
                    className={cn(
                        'mx-auto h-full min-h-[32rem] overflow-hidden rounded-md border bg-background shadow-sm transition-[width]',
                        activeDevice.className,
                    )}
                >
                    {previewUrl ? (
                        <iframe
                            key={`${previewUrl}-${device}`}
                            title={__(
                                'builder.responsive_preview',
                                'Preview',
                            )}
                            src={previewUrl}
                            className="h-full w-full bg-background"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                            {__(
                                'builder.preview_unavailable',
                                'Preview is unavailable.',
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const fullscreenOverlay = isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold">
                        {__(
                            'builder.responsive_preview',
                            'Preview',
                        )}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {previewStatus}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {deviceSelector}

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            title={__(
                                'builder.refresh_preview',
                                'Refresh preview',
                            )}
                        >
                            <RefreshCw
                                className={cn(
                                    'h-4 w-4',
                                    isRefreshing && 'animate-spin',
                                )}
                            />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onOpenPreview}
                            title={__(
                                'builder.open_preview',
                                'Open preview',
                            )}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(false)}
                            title={__(
                                'builder.exit_fullscreen',
                                'Exit fullscreen',
                            )}
                        >
                            <Minimize2 className="mr-1 h-4 w-4" />
                            {__(
                                'builder.close',
                                'Close',
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-muted/40 p-4">
                <div
                    className={cn(
                        'mx-auto h-full overflow-hidden rounded-md border bg-background shadow-sm transition-[width]',
                        activeDevice.className,
                    )}
                >
                    {previewUrl ? (
                        <iframe
                            key={`${previewUrl}-${device}-fullscreen`}
                            title={__(
                                'builder.responsive_preview',
                                'Preview',
                            )}
                            src={previewUrl}
                            className="h-full w-full bg-background"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                            {__(
                                'builder.preview_unavailable',
                                'Preview is unavailable.',
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-hidden rounded-lg border bg-background lg:block">
                {inspector ? (
                    <Tabs defaultValue="inspector" className="h-full">
                        <div className="border-b p-2">
                            <TabsList
                                className={`grid w-full ${health ? 'grid-cols-3' : 'grid-cols-2'}`}
                            >
                                <TabsTrigger value="inspector">
                                    {__(
                                        'builder.inspector',
                                        'Inspector',
                                    )}
                                </TabsTrigger>
                                {health && (
                                    <TabsTrigger value="health">
                                        {__(
                                            'builder.health',
                                            'Health',
                                        )}
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="preview">
                                    {__(
                                        'builder.preview',
                                        'Preview',
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent
                            value="inspector"
                            className="mt-0 max-h-[calc(100vh-10.5rem)] overflow-auto"
                        >
                            {inspector}
                        </TabsContent>
                        {health && (
                            <TabsContent
                                value="health"
                                className="mt-0 max-h-[calc(100vh-10.5rem)] overflow-auto"
                            >
                                {health}
                            </TabsContent>
                        )}
                        <TabsContent value="preview" className="mt-0">
                            {previewContent}
                        </TabsContent>
                    </Tabs>
                ) : (
                    previewContent
                )}
            </aside>

            {fullscreenOverlay}
        </>
    );
}
