import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

// Filter field type for defining filterable columns
export type FilterField = {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string; label: string }[];
};

// Active filter type
export type ActiveFilter = {
  field: string;
  value: string;
  label?: string;
};

// DataTable props with generic type
export interface DataTableProps<TData> {
  // Core data
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;

  // Display options
  title?: string;
  description?: string;
  emptyState?: ReactNode;

  // Pagination (server-side)
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Search
  searchPlaceholder?: string;
  onSearch: (value: string) => void;

  // Sorting (server-side)
  sortBy?: string;
  sortDesc?: boolean;
  onSortChange?: (sortBy: string, sortDesc: boolean) => void;

  // Filtering
  filterFields?: FilterField[];
  filters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;

  // Actions
  onAdd?: () => void;
  addButtonText?: string;
}

// Pagination props
export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Search props
export interface DataTableSearchProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

// Filters props
export interface DataTableFiltersProps {
  filterFields: FilterField[];
  filters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
}

// Toolbar props
export interface DataTableToolbarProps {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch: (value: string) => void;
  filterFields?: FilterField[];
  filters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
  onAdd?: () => void;
  addButtonText?: string;
}
