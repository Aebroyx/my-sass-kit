'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTable } from '@/components/ui/DataTable';
import { useGetAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLog } from '@/services/auditService';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';

// Helper to format action with color badges
const getActionBadge = (action: string) => {
  const colorMap: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    LOGIN_SUCCESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    LOGIN_FAILED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const colorClass = colorMap[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {action}
    </span>
  );
};

export default function AuditLogsPage() {
  // Check permissions
  const { hasAccess } = usePermission();

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDesc, setSortDesc] = useState(true);

  // Additional filters
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounce search
  const search = useDebounce(searchInput, 300);

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      username?: string;
      action?: string;
      resource_type?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      start_date?: string;
      end_date?: string;
    } = {
      page,
      limit: pageSize,
      sort_by: sortBy,
      sort_order: sortDesc ? 'desc' : 'asc',
    };

    if (search) params.username = search;
    if (actionFilter) params.action = actionFilter;
    if (resourceTypeFilter) params.resource_type = resourceTypeFilter;
    if (startDate) params.start_date = new Date(startDate).toISOString();
    if (endDate) params.end_date = new Date(endDate).toISOString();

    return params;
  }, [page, pageSize, search, actionFilter, resourceTypeFilter, sortBy, sortDesc, startDate, endDate]);

  // Fetch audit logs
  const { data, isLoading, error } = useGetAuditLogs(queryParams);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on search
  };

  const handleSortChange = (newSortBy: string, newSortDesc: boolean) => {
    setSortBy(newSortBy);
    setSortDesc(newSortDesc);
  };

  // Define table columns
  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {format(new Date(row.original.timestamp), 'MMM dd, yyyy HH:mm:ss')}
          </span>
        ),
      },
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => (
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.username || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => getActionBadge(row.original.action),
      },
      {
        accessorKey: 'resource_type',
        header: 'Resource Type',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.resource_type || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'resource_id',
        header: 'Resource ID',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.resource_id || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'ip_address',
        header: 'IP Address',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
            {row.original.ip_address}
          </span>
        ),
      },
    ],
    []
  );

  // Filter fields for the DataTable component
  const filterFields: any[] = [];

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading audit logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Track all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Action
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resource Type
          </label>
          <input
            type="text"
            value={resourceTypeFilter}
            onChange={(e) => {
              setResourceTypeFilter(e.target.value);
              setPage(1);
            }}
            placeholder="e.g., users, roles"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        pageSize={pageSize}
        totalItems={data?.total || 0}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        searchPlaceholder="Search by username..."
        filterFields={filterFields}
        enableColumnVisibility={true}
        enableDensity={true}
      />
    </div>
  );
}
