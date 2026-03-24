import type { ColumnDef } from '@tanstack/react-table';
import type { PaginationInfo } from '@/types';

export interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    pagination?: PaginationInfo;
    sortable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearch?: (value: string) => void;
    onPerPageChange?: (perPage: number) => void;
    onSortChange?: (sort: string) => void;
    baseUrl?: string;
    className?: string;
}
