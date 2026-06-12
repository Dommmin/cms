'use no memo';

import { Link, router } from '@inertiajs/react';
import { flexRender } from '@tanstack/react-table';
import { ChevronRightIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { DataTableProps } from './data-table.types';

export default function DataTable<T>({
    columns,
    data,
    pagination,
    searchable = false,
    searchPlaceholder,
    searchValue = '',
    onSearch,
    onPerPageChange,
    baseUrl,
    className,
    mobilePrimaryColumns = 3,
    mobileCardTitle,
    mobileEmptyLabel,
    mobileLayout = 'table',
    tableMinWidthClassName,
}: DataTableProps<T>) {
    'use no memo';

    const __ = useTranslation();
    const [search, setSearch] = useState(searchValue);
    const [detailsRowIndex, setDetailsRowIndex] = useState<number | null>(null);
    const perPageOptions = pagination
        ? Array.from(new Set([10, 25, 50, 100, pagination.per_page])).sort(
              (a, b) => a - b,
          )
        : [10, 25, 50, 100];

    const handleSearch = useCallback(() => {
        const currentParams =
            typeof window !== 'undefined'
                ? Object.fromEntries(
                      new URLSearchParams(window.location.search).entries(),
                  )
                : {};

        if (onSearch) {
            onSearch(search);
        } else if (baseUrl) {
            router.get(
                baseUrl,
                { ...currentParams, search: search || undefined, page: 1 },
                { replace: true, preserveState: true },
            );
        }
    }, [search, onSearch, baseUrl]);

    const getColumnId = (column: (typeof columns)[number], index: number) =>
        column.id ??
        ('accessorKey' in column && typeof column.accessorKey === 'string'
            ? column.accessorKey
            : `col-${index}`);

    const getCellValue = (
        row: T,
        column: (typeof columns)[number],
        rowIndex: number,
    ) => {
        if ('accessorFn' in column && typeof column.accessorFn === 'function') {
            return column.accessorFn(row, rowIndex);
        }
        if ('accessorKey' in column && typeof column.accessorKey === 'string') {
            return (row as Record<string, unknown>)[column.accessorKey];
        }
        return undefined;
    };

    const renderHeader = (column: (typeof columns)[number]) =>
        flexRender(column.header, { column } as never);

    const renderCell = (
        row: T,
        rowIndex: number,
        column: (typeof columns)[number],
    ) => {
        const value = getCellValue(row, column, rowIndex);

        return flexRender(column.cell, {
            row: {
                original: row,
                index: rowIndex,
                getValue: () => value,
            },
            column,
            getValue: () => value,
        } as never);
    };

    const visibleColumns = columns.filter((column) => {
        const meta = (column as { meta?: { mobileHidden?: boolean } }).meta;

        return !meta?.mobileHidden;
    });

    const mobileSummaryColumns = visibleColumns.slice(
        0,
        Math.max(1, mobilePrimaryColumns),
    );
    const mobileDetailColumns = visibleColumns.slice(
        Math.max(1, mobilePrimaryColumns),
    );
    const selectedRow = detailsRowIndex !== null ? data[detailsRowIndex] : null;
    const visibleRangeStart =
        pagination && pagination.total > 0
            ? (pagination.current_page - 1) * pagination.per_page + 1
            : 0;
    const visibleRangeEnd = pagination
        ? pagination.total > 0
            ? Math.min(
                  pagination.current_page * pagination.per_page,
                  pagination.total,
              )
            : 0
        : 0;

    const isEmptyValue = (value: unknown): boolean =>
        value === null || value === undefined || value === '';

    return (
        <div className={cn('space-y-4', className)}>
            {searchable && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        placeholder={
                            searchPlaceholder ??
                            __('placeholder.search', 'Search...')
                        }
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button
                        variant="secondary"
                        onClick={handleSearch}
                        className="w-full sm:w-auto"
                    >
                        {__('action.search', 'Search')}
                    </Button>
                </div>
            )}

            {mobileLayout === 'cards' ? (
                <div className="space-y-3 md:hidden">
                    {data.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                {mobileEmptyLabel ??
                                    __('empty.no_results', 'No results.')}
                            </CardContent>
                        </Card>
                    ) : (
                        data.map((row, rowIndex) => (
                            <Card key={rowIndex}>
                                <CardContent className="space-y-3 p-3.5">
                                    <div className="space-y-2.5">
                                        {mobileCardTitle ? (
                                            <div className="min-w-0 text-sm font-medium">
                                                {mobileCardTitle(row, rowIndex)}
                                            </div>
                                        ) : (
                                            <div className="min-w-0">
                                                {renderCell(
                                                    row,
                                                    rowIndex,
                                                    mobileSummaryColumns[0],
                                                )}
                                            </div>
                                        )}

                                        <dl className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
                                            {mobileSummaryColumns
                                                .slice(1)
                                                .map((column, columnIndex) => {
                                                    const value = getCellValue(
                                                        row,
                                                        column,
                                                        rowIndex,
                                                    );

                                                    if (isEmptyValue(value)) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div
                                                            key={getColumnId(
                                                                column,
                                                                columnIndex,
                                                            )}
                                                            className="min-w-0 space-y-1"
                                                        >
                                                            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                {renderHeader(
                                                                    column,
                                                                )}
                                                            </dt>
                                                            <dd className="min-w-0 text-sm">
                                                                {renderCell(
                                                                    row,
                                                                    rowIndex,
                                                                    column,
                                                                )}
                                                            </dd>
                                                        </div>
                                                    );
                                                })}
                                        </dl>
                                    </div>

                                    {mobileDetailColumns.length > 0 && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            onClick={() =>
                                                setDetailsRowIndex(rowIndex)
                                            }
                                        >
                                            {__(
                                                'action.view_details',
                                                'View details',
                                            )}
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            ) : null}

            <div
                className={cn(
                    'overflow-x-auto rounded-md border',
                    mobileLayout === 'cards' ? 'hidden md:block' : 'block',
                )}
            >
                <table
                    className={cn(
                        'w-full min-w-max text-sm',
                        tableMinWidthClassName,
                    )}
                >
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((column, index) => {
                                const customClassName = (
                                    column as { meta?: { className?: string } }
                                ).meta?.className;
                                return (
                                    <th
                                        key={getColumnId(column, index)}
                                        className={cn(
                                            'h-10 px-3 text-left align-middle font-medium text-muted-foreground',
                                            customClassName,
                                        )}
                                    >
                                        {renderHeader(column)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {__('empty.no_results', 'No results.')}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-t transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    {columns.map((column, colIndex) => {
                                        const columnId = getColumnId(
                                            column,
                                            colIndex,
                                        );
                                        const customClassName = (
                                            column as {
                                                meta?: { className?: string };
                                            }
                                        ).meta?.className;
                                        return (
                                            <td
                                                key={`${rowIndex}-${columnId}`}
                                                className={cn(
                                                    'p-3 align-middle',
                                                    customClassName,
                                                )}
                                            >
                                                {renderCell(
                                                    row,
                                                    rowIndex,
                                                    column,
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {__('misc.showing', 'Showing')} {visibleRangeStart}{' '}
                            – {visibleRangeEnd} {__('misc.of', 'of')}{' '}
                            {pagination.total}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                            value={pagination.per_page.toString()}
                            onValueChange={(value) => {
                                if (onPerPageChange) {
                                    onPerPageChange(parseInt(value));
                                } else if (baseUrl) {
                                    const currentParams =
                                        typeof window !== 'undefined'
                                            ? Object.fromEntries(
                                                  new URLSearchParams(
                                                      window.location.search,
                                                  ).entries(),
                                              )
                                            : {};
                                    router.get(
                                        baseUrl,
                                        {
                                            ...currentParams,
                                            per_page: parseInt(value),
                                            page: 1,
                                        },
                                        { replace: true, preserveState: true },
                                    );
                                }
                            }}
                        >
                            <SelectTrigger className="h-8 w-full sm:w-[70px]">
                                <SelectValue
                                    placeholder={pagination.per_page.toString()}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {perPageOptions.map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={pageSize.toString()}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-1">
                            {pagination.prev_page_url ? (
                                <Link
                                    href={pagination.prev_page_url}
                                    preserveScroll
                                    prefetch
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        {__('misc.previous', 'Previous')}
                                    </Button>
                                </Link>
                            ) : (
                                <div className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="w-full"
                                    >
                                        {__('misc.previous', 'Previous')}
                                    </Button>
                                </div>
                            )}

                            {pagination.next_page_url ? (
                                <Link
                                    href={pagination.next_page_url}
                                    preserveScroll
                                    prefetch
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        {__('misc.next', 'Next')}
                                    </Button>
                                </Link>
                            ) : (
                                <div className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="w-full"
                                    >
                                        {__('misc.next', 'Next')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Sheet
                open={detailsRowIndex !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailsRowIndex(null);
                    }
                }}
            >
                <SheetContent side="bottom" className="max-h-[85vh]">
                    <SheetHeader>
                        <SheetTitle>
                            {__('table.details', 'Row details')}
                        </SheetTitle>
                        <SheetDescription>
                            {__(
                                'table.details_desc',
                                'Additional row data and actions.',
                            )}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 overflow-y-auto px-4 pb-6">
                        {selectedRow &&
                            mobileDetailColumns.map((column, columnIndex) => (
                                <div
                                    key={getColumnId(column, columnIndex)}
                                    className="space-y-1"
                                >
                                    <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {renderHeader(column)}
                                    </div>
                                    <div className="text-sm">
                                        {renderCell(
                                            selectedRow,
                                            detailsRowIndex ?? 0,
                                            column,
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
