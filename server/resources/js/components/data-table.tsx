'use no memo';

import { Link, router } from '@inertiajs/react';
import { flexRender } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
}: DataTableProps<T>) {
    'use no memo';

    const __ = useTranslation();
    const [search, setSearch] = useState(searchValue);
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

    return (
        <div className={cn('space-y-4', className)}>
            {searchable && (
                <div className="flex items-center gap-2">
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
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button variant="secondary" onClick={handleSearch}>
                        {__('action.search', 'Search')}
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-max text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={getColumnId(column, index)}
                                    className="h-10 px-3 text-left align-middle font-medium text-muted-foreground"
                                >
                                    {flexRender(column.header, {
                                        column,
                                    } as never)}
                                </th>
                            ))}
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
                                        const value = getCellValue(
                                            row,
                                            column,
                                            rowIndex,
                                        );
                                        const columnId = getColumnId(
                                            column,
                                            colIndex,
                                        );
                                        return (
                                            <td
                                                key={`${rowIndex}-${columnId}`}
                                                className="p-3 align-middle"
                                            >
                                                {flexRender(column.cell, {
                                                    row: {
                                                        original: row,
                                                        index: rowIndex,
                                                        getValue: () => value,
                                                    },
                                                    column,
                                                    getValue: () => value,
                                                } as never)}
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {__('misc.showing', 'Showing')}{' '}
                            {(pagination.current_page - 1) *
                                pagination.per_page +
                                1}{' '}
                            –{' '}
                            {Math.min(
                                pagination.current_page * pagination.per_page,
                                pagination.total,
                            )}{' '}
                            {__('misc.of', 'of')} {pagination.total}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                            <SelectTrigger className="h-8 w-[70px]">
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

                        <div className="flex gap-1">
                            {pagination.prev_page_url ? (
                                <Link
                                    href={pagination.prev_page_url}
                                    preserveScroll
                                    prefetch
                                >
                                    <Button variant="outline" size="sm">
                                        {__('misc.previous', 'Previous')}
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    {__('misc.previous', 'Previous')}
                                </Button>
                            )}

                            {pagination.next_page_url ? (
                                <Link
                                    href={pagination.next_page_url}
                                    preserveScroll
                                    prefetch
                                >
                                    <Button variant="outline" size="sm">
                                        {__('misc.next', 'Next')}
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    {__('misc.next', 'Next')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
