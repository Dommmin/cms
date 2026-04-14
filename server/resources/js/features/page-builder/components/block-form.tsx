/**
 * Block Form Component
 * Unified form: block type selector + schema-driven fields + active toggle.
 * No more tab separation — media and relations are inline with content fields.
 */

import { ChevronDownIcon, Globe2Icon, UnlinkIcon } from 'lucide-react';
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
                    <div className="space-y-1.5">
                        <Label htmlFor="custom-classes">Custom CSS Classes</Label>
                        <input
                            id="custom-classes"
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="my-class another-class"
                            value={(block.configuration._custom_classes as string) ?? ''}
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
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="hero-section"
                            value={(block.configuration._custom_id as string) ?? ''}
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
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder={'/* Custom CSS for this block */\n.my-class { color: red; }'}
                            value={(block.configuration._custom_css as string) ?? ''}
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
                            CSS is scoped to this block. Avoid &lt;script&gt; or external URLs.
                        </p>
                    </div>
                </div>
            </details>
        </div>
    );
}
