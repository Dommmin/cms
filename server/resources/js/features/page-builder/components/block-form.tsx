/**
 * Block Form Component
 * Unified form: block type selector + schema-driven fields + active toggle.
 * No more tab separation — media and relations are inline with content fields.
 */

import {
    ChevronDownIcon,
    Globe2Icon,
    LockIcon,
    UnlinkIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { BlockTypeConfig } from '../types';
import type { BlockFormProps } from './block-form.types';
import { DynamicBlockForm } from './dynamic-block-form';

export function BlockForm({
    block,
    availableBlockTypes,
    onUpdate,
    onUnlinkReusable,
}: BlockFormProps) {
    const currentBlockConfig = availableBlockTypes[block.type];
    const isLinkedGlobal = !!block.reusable_block_id;

    // Locked block — show unlock banner and return early
    if (block.configuration._locked) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <LockIcon className="h-4 w-4 shrink-0 text-amber-600" />
                    <div className="flex-1 text-sm">
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                            Block Locked
                        </span>
                        <p className="text-xs text-amber-600">
                            This block is protected from editing.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            onUpdate({
                                configuration: {
                                    ...block.configuration,
                                    _locked: false,
                                },
                            })
                        }
                        className="text-xs text-amber-600 underline hover:text-amber-800"
                    >
                        Unlock
                    </button>
                </div>
            </div>
        );
    }

    // Group block types by category for the selector
    const grouped = Object.entries(availableBlockTypes).reduce<
        Record<string, Array<[string, BlockTypeConfig]>>
    >((acc, entry) => {
        const [, config] = entry;
        const cat = config.category ?? 'other';
        (acc[cat] ??= []).push(entry);
        return acc;
    }, {});

    return (
        <div className="space-y-5">
            {/* Global block banner */}
            {isLinkedGlobal && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                    <Globe2Icon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1 text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                            Global Block
                        </span>
                        {block.reusable_block_name && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                                — {block.reusable_block_name}
                            </span>
                        )}
                        <p className="text-xs text-blue-500 dark:text-blue-400">
                            Changes propagate to all pages using this block.
                        </p>
                    </div>
                    {onUnlinkReusable && (
                        <button
                            type="button"
                            onClick={onUnlinkReusable}
                            className="flex items-center gap-1 rounded text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            title="Unlink from global block (creates a local copy)"
                        >
                            <UnlinkIcon className="h-3 w-3" />
                            Unlink
                        </button>
                    )}
                </div>
            )}

            {/* Block type selector */}
            <div className="space-y-1.5">
                <Label htmlFor="block-type">Block Type</Label>
                <Select
                    value={block.type}
                    onValueChange={(value) =>
                        onUpdate({ type: value, configuration: {} })
                    }
                    disabled={isLinkedGlobal}
                >
                    <SelectTrigger id="block-type">
                        <SelectValue placeholder="Select block type…" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(grouped).map(([category, entries]) => (
                            <div key={category}>
                                <div className="px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {category.replace(/-/g, ' ')}
                                </div>
                                {entries.map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.name}
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
                {currentBlockConfig?.description && (
                    <p className="text-xs text-muted-foreground">
                        {currentBlockConfig.description}
                    </p>
                )}
            </div>

            {/* Active status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">Visible</p>
                    <p className="text-xs text-muted-foreground">
                        Show this block on the page
                    </p>
                </div>
                <Switch
                    checked={block.is_active}
                    onCheckedChange={(checked) =>
                        onUpdate({ is_active: checked })
                    }
                />
            </div>

            {/* Schema-driven content fields + relations */}
            {block.type && currentBlockConfig && (
                <DynamicBlockForm
                    block={block}
                    blockTypeConfig={currentBlockConfig}
                    onUpdateConfig={(config) =>
                        onUpdate({ configuration: config })
                    }
                    onUpdateRelations={(relations) => onUpdate({ relations })}
                />
            )}

            {!block.type && (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Select a block type above to configure its content.
                </div>
            )}

            {/* Advanced: Custom CSS / Classes / ID */}
            <details className="group rounded-lg border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium select-none">
                    <span>Advanced</span>
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-3 border-t px-4 py-3">
                    {/* Animation */}
                    <div className="space-y-3 border-b pb-3">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Animation
                        </p>
                        <div className="space-y-1.5">
                            <Label>Animation Type</Label>
                            <Select
                                value={
                                    ((
                                        block.configuration
                                            ._animation as Record<
                                            string,
                                            unknown
                                        >
                                    )?.type as string) ?? 'none'
                                }
                                onValueChange={(value) =>
                                    onUpdate({
                                        configuration: {
                                            ...block.configuration,
                                            _animation: {
                                                ...((block.configuration
                                                    ._animation as object) ??
                                                    {}),
                                                type: value,
                                            },
                                        },
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        [
                                            ['none', 'None'],
                                            ['fade-in', 'Fade In'],
                                            ['slide-up', 'Slide Up'],
                                            ['slide-left', 'Slide Left'],
                                            ['slide-right', 'Slide Right'],
                                            ['scale-in', 'Scale In'],
                                        ] as [string, string][]
                                    ).map(([v, l]) => (
                                        <SelectItem key={v} value={v}>
                                            {l}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {((
                            block.configuration._animation as Record<
                                string,
                                unknown
                            >
                        )?.type ?? 'none') !== 'none' && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label>Duration</Label>
                                        <Select
                                            value={
                                                ((
                                                    block.configuration
                                                        ._animation as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )?.duration as string) ??
                                                'normal'
                                            }
                                            onValueChange={(v) =>
                                                onUpdate({
                                                    configuration: {
                                                        ...block.configuration,
                                                        _animation: {
                                                            ...((block
                                                                .configuration
                                                                ._animation as object) ??
                                                                {}),
                                                            duration: v,
                                                        },
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fast">
                                                    Fast (200ms)
                                                </SelectItem>
                                                <SelectItem value="normal">
                                                    Normal (500ms)
                                                </SelectItem>
                                                <SelectItem value="slow">
                                                    Slow (800ms)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Trigger</Label>
                                        <Select
                                            value={
                                                ((
                                                    block.configuration
                                                        ._animation as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )?.trigger as string) ??
                                                'on-scroll'
                                            }
                                            onValueChange={(v) =>
                                                onUpdate({
                                                    configuration: {
                                                        ...block.configuration,
                                                        _animation: {
                                                            ...((block
                                                                .configuration
                                                                ._animation as object) ??
                                                                {}),
                                                            trigger: v,
                                                        },
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="on-scroll">
                                                    On Scroll
                                                </SelectItem>
                                                <SelectItem value="on-load">
                                                    On Load
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Delay (ms)</Label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={2000}
                                        step={100}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={
                                            ((
                                                block.configuration
                                                    ._animation as Record<
                                                    string,
                                                    unknown
                                                >
                                            )?.delay as number) ?? 0
                                        }
                                        onChange={(e) =>
                                            onUpdate({
                                                configuration: {
                                                    ...block.configuration,
                                                    _animation: {
                                                        ...((block.configuration
                                                            ._animation as object) ??
                                                            {}),
                                                        delay: parseInt(
                                                            e.target.value,
                                                        ),
                                                    },
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="custom-classes">
                            Custom CSS Classes
                        </Label>
                        <input
                            id="custom-classes"
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            placeholder="my-class another-class"
                            value={
                                (block.configuration
                                    ._custom_classes as string) ?? ''
                            }
                            onChange={(e) =>
                                onUpdate({
                                    configuration: {
                                        ...block.configuration,
                                        _custom_classes: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="custom-id">Custom Element ID</Label>
                        <input
                            id="custom-id"
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            placeholder="hero-section"
                            value={
                                (block.configuration._custom_id as string) ?? ''
                            }
                            onChange={(e) =>
                                onUpdate({
                                    configuration: {
                                        ...block.configuration,
                                        _custom_id: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="custom-css">Custom CSS</Label>
                        <textarea
                            id="custom-css"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            placeholder={
                                '/* Custom CSS for this block */\n.my-class { color: red; }'
                            }
                            value={
                                (block.configuration._custom_css as string) ??
                                ''
                            }
                            onChange={(e) =>
                                onUpdate({
                                    configuration: {
                                        ...block.configuration,
                                        _custom_css: e.target.value,
                                    },
                                })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            CSS is scoped to this block. Avoid &lt;script&gt; or
                            external URLs.
                        </p>
                    </div>

                    {/* Lock Block */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="flex items-center gap-1.5 text-sm font-medium">
                                <LockIcon className="h-3.5 w-3.5" />
                                Lock Block
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Prevent editing, moving, and deleting
                            </p>
                        </div>
                        <Switch
                            checked={!!block.configuration._locked}
                            onCheckedChange={(checked) =>
                                onUpdate({
                                    configuration: {
                                        ...block.configuration,
                                        _locked: checked,
                                    },
                                })
                            }
                        />
                    </div>
                </div>
            </details>
        </div>
    );
}
