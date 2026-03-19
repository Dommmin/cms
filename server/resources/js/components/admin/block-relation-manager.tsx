import {
    PlusIcon,
    GripVerticalIcon,
    TrashIcon,
    ImageIcon,
    ShoppingBagIcon,
    FolderIcon,
    FileIcon,
    SearchIcon,
    LoaderIcon,
    CheckIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    MediaPickerModal,
    type MediaItem,
} from '@/components/media-picker-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export type RelationType =
    | 'media.image'
    | 'media.icon'
    | 'media.file'
    | 'media.video'
    | 'product'
    | 'category'
    | 'brand'
    | 'page'
    | 'menu'
    | 'form'
    | 'faq';

export interface RelationConfig {
    types: RelationType[];
    multiple: boolean;
}

export interface Relation {
    type: RelationType;
    id: number;
    metadata?: Record<string, unknown>;
}

export interface BlockRelationManagerProps {
    blockType: string;
    allowedRelations: Record<string, RelationConfig>;
    value: Record<string, Relation | Relation[]>;
    onChange: (relations: Record<string, Relation | Relation[]>) => void;
}

type SearchResult = { id: number; name: string };

const MODEL_TYPE_LABELS: Record<string, string> = {
    category: 'Category',
    product: 'Product',
    brand: 'Brand',
    page: 'Page',
    menu: 'Menu',
    form: 'Form',
    faq: 'FAQ',
};

function isMediaType(type: RelationType): boolean {
    return type.startsWith('media.');
}

/** Modal for picking a model relation (category, product, brand, page, etc.) */
function ModelPickerModal({
    open,
    onClose,
    onSelect,
    relationType,
    multiple,
    selectedIds,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (item: SearchResult) => void;
    relationType: RelationType;
    multiple: boolean;
    selectedIds: number[];
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const doSearch = useCallback(
        function doSearch(q: string) {
            if (abortRef.current) {
                abortRef.current.abort();
            }
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);

            fetch(
                `/admin/block-relations/search?type=${encodeURIComponent(relationType)}&q=${encodeURIComponent(q)}`,
                { signal: controller.signal },
            )
                .then((r) => r.json())
                .then((data: SearchResult[]) => {
                    setResults(data);
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        setLoading(false);
                    }
                });
        },
        [relationType],
    );

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery('');
            setResults([]);
            return;
        }
        // Autofocus + load initial results
        setTimeout(() => inputRef.current?.focus(), 100);
        doSearch('');
    }, [open, doSearch]);

    useEffect(() => {
        const timer = setTimeout(() => doSearch(query), 250);
        return () => clearTimeout(timer);
    }, [query, doSearch]);

    const label = MODEL_TYPE_LABELS[relationType] ?? relationType;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select {label}</DialogTitle>
                    <DialogDescription>
                        Search and select {multiple ? 'one or more' : 'a'}{' '}
                        {label.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${label.toLowerCase()}...`}
                        className="pl-9"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-md border">
                    {loading && (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {!loading && results.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No {label.toLowerCase()} found.
                        </p>
                    )}

                    {!loading &&
                        results.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected && multiple) return; // prevent duplicate
                                        onSelect(item);
                                        if (!multiple) {
                                            onClose();
                                        }
                                    }}
                                    disabled={isSelected && multiple}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-accent disabled:opacity-50"
                                >
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                    <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                                        #{item.id}
                                        {isSelected && (
                                            <CheckIcon className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                </div>

                {multiple && (
                    <div className="flex justify-end border-t pt-3">
                        <Button size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function BlockRelationManager({
    blockType: _blockType,
    allowedRelations,
    value,
    onChange,
}: BlockRelationManagerProps) {
    const [activeTab, setActiveTab] = useState<string>(
        Object.keys(allowedRelations)[0] || '',
    );
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [modelPickerOpen, setModelPickerOpen] = useState(false);
    const [pickerKey, setPickerKey] = useState<string>('');

    const handleAddRelation = (key: string, relation: Relation) => {
        const current = value[key];
        const isMultiple = allowedRelations[key].multiple;

        if (isMultiple) {
            // current may be undefined, a single Relation, or a Relation[]
            const existing = Array.isArray(current)
                ? current
                : current
                  ? [current]
                  : [];
            onChange({
                ...value,
                [key]: [...existing, relation],
            });
        } else {
            onChange({ ...value, [key]: relation });
        }
    };

    const handleRemoveRelation = (key: string, index?: number) => {
        const current = value[key];

        if (Array.isArray(current) && index !== undefined) {
            const updated = current.filter((_, i) => i !== index);
            if (updated.length === 0) {
                const newValue = { ...value };
                delete newValue[key];
                onChange(newValue);
            } else {
                onChange({ ...value, [key]: updated });
            }
        } else {
            const newValue = { ...value };
            delete newValue[key];
            onChange(newValue);
        }
    };

    const handleReorder = (key: string, fromIndex: number, toIndex: number) => {
        const current = value[key];
        if (!Array.isArray(current)) return;

        const updated = [...current];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        onChange({ ...value, [key]: updated });
    };

    const handleMediaSelect = (media: MediaItem[]) => {
        if (!pickerKey || !media.length) return;

        const config = allowedRelations[pickerKey];
        const type =
            (config.types.find((t) =>
                t.startsWith('media.'),
            ) as RelationType) || 'media.image';

        media.forEach((item) => {
            handleAddRelation(pickerKey, {
                type,
                id: item.id,
                metadata: { name: item.name, file_name: item.file_name },
            });
        });

        setMediaPickerOpen(false);
    };

    const handleModelSelect = (item: SearchResult) => {
        const config = allowedRelations[pickerKey];
        const modelType = config.types.find((t) => !t.startsWith('media.'));
        if (!modelType) return;

        handleAddRelation(pickerKey, {
            type: modelType,
            id: item.id,
            metadata: { name: item.name },
        });
    };

    const openPicker = (key: string) => {
        setPickerKey(key);
        setActiveTab(key);

        const config = allowedRelations[key];
        const hasMedia = config.types.some((t) => t.startsWith('media.'));

        if (hasMedia) {
            setMediaPickerOpen(true);
        } else {
            setModelPickerOpen(true);
        }
    };

    const getSelectedMedia = (
        key: string,
    ): { id: number; url: string; name: string; is_thumbnail: boolean }[] => {
        const relation = value[key];
        if (!relation) return [];

        const relations = Array.isArray(relation) ? relation : [relation];
        return relations.map((rel) => ({
            id: rel.id,
            url: '',
            name: String(rel.metadata?.name || `Item ${rel.id}`),
            is_thumbnail: false,
        }));
    };

    const getRelationIcon = (type: RelationType) => {
        if (type.startsWith('media.')) return ImageIcon;
        if (type === 'product') return ShoppingBagIcon;
        if (type === 'category') return FolderIcon;
        return FileIcon;
    };

    const activeRelationType = pickerKey
        ? (allowedRelations[pickerKey]?.types.find(
              (t) => !t.startsWith('media.'),
          ) ?? 'category')
        : 'category';

    if (Object.keys(allowedRelations).length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No relations configured for this block type.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex flex-wrap gap-2 border-b pb-2">
                {Object.entries(allowedRelations).map(([key]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeTab === key
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {key.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-4">
                {Object.entries(allowedRelations).map(([key, config]) => (
                    <div
                        key={key}
                        className={activeTab === key ? 'block' : 'hidden'}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                            </h4>
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => openPicker(key)}
                            >
                                <PlusIcon className="mr-1 h-4 w-4" />
                                Add{' '}
                                {config.types.some((t) => !isMediaType(t))
                                    ? (MODEL_TYPE_LABELS[
                                          config.types.find(
                                              (t) => !t.startsWith('media.'),
                                          )!
                                      ] ?? '')
                                    : ''}
                            </Button>
                        </div>

                        {(() => {
                            const current = value[key];
                            const isMultiple = config.multiple;

                            if (
                                !current ||
                                (Array.isArray(current) && current.length === 0)
                            ) {
                                return (
                                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        No items selected. Click "Add" to
                                        select.
                                    </div>
                                );
                            }

                            const items = Array.isArray(current)
                                ? current
                                : [current];

                            return (
                                <div className="space-y-2">
                                    {items.map((relation, index) => {
                                        const Icon = getRelationIcon(
                                            relation.type,
                                        );

                                        return (
                                            <div
                                                key={`${relation.id}-${index}`}
                                                className="flex items-center gap-2 rounded-lg border bg-background p-3"
                                            >
                                                {isMultiple && (
                                                    <GripVerticalIcon className="h-4 w-4 cursor-grab text-muted-foreground" />
                                                )}
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {String(
                                                            relation.metadata
                                                                ?.name ||
                                                                `Item #${relation.id}`,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {relation.type} #
                                                        {relation.id}
                                                    </p>
                                                </div>
                                                {isMultiple && index > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleReorder(
                                                                key,
                                                                index,
                                                                index - 1,
                                                            )
                                                        }
                                                    >
                                                        ↑
                                                    </Button>
                                                )}
                                                {isMultiple &&
                                                    index <
                                                        items.length - 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            type="button"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                handleReorder(
                                                                    key,
                                                                    index,
                                                                    index + 1,
                                                                )
                                                            }
                                                        >
                                                            ↓
                                                        </Button>
                                                    )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() =>
                                                        handleRemoveRelation(
                                                            key,
                                                            isMultiple
                                                                ? index
                                                                : undefined,
                                                        )
                                                    }
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                ))}
            </div>

            {/* Media picker */}
            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={(media) => handleMediaSelect([media])}
                onReorder={() => {}}
                onRemove={() => {}}
                onSetThumbnail={() => {}}
                selectedImages={getSelectedMedia(pickerKey)}
                multiple={true}
            />

            {/* Model picker (categories, products, brands, pages, etc.) */}
            <ModelPickerModal
                open={modelPickerOpen}
                onClose={() => setModelPickerOpen(false)}
                onSelect={handleModelSelect}
                relationType={activeRelationType as RelationType}
                multiple={
                    pickerKey
                        ? (allowedRelations[pickerKey]?.multiple ?? false)
                        : false
                }
                selectedIds={(() => {
                    if (!pickerKey) return [];
                    const current = value[pickerKey];
                    if (!current) return [];
                    const items = Array.isArray(current) ? current : [current];
                    return items.map((r) => r.id);
                })()}
            />
        </div>
    );
}
