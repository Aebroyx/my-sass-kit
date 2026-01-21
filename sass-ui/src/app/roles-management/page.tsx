'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { Navigation } from '@/components/Navigation';
import { DataTable, FilterField } from '@/components/ui/DataTable';
import DeleteModal from '@/components/modals/DeleteModal';
import { useGetAllRoles, useDeleteRole } from '@/hooks/useRole';
import { RoleResponse } from '@/services/roleService';
import { useDebounce } from '@/hooks/useDebounce';

// Helper function to check if role can be deleted
const canDeleteRole = (role: RoleResponse): boolean => {
  // Prevent deletion of protected roles
  const protectedRoles = ['root', 'admin', 'user'];
  if (role.name && protectedRoles.includes(role.name.toLowerCase())) {
    return false;
  }
  
  return true;
};

export default function RolesManagementPage() {
  const router = useRouter();

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Debounce search
  const search = useDebounce(searchInput, 300);

  // Fetch roles data
  const { data, isLoading, error } = useGetAllRoles({
    page,
    pageSize,
    search,
    sortBy,
    sortDesc,
    filters,
  });

  // Delete role mutation
  const deleteRole = useDeleteRole();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  // Handlers
  const openDeleteModal = (id: number) => {
    setRoleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole.mutateAsync(id);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleConfirmDelete = () => {
    if (!roleToDelete) return;
    handleDelete(roleToDelete);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortDesc: boolean) => {
    setSortBy(newSortBy);
    setSortDesc(newSortDesc);
  };

  // Define table columns
  const columns = useMemo<ColumnDef<RoleResponse>[]>(
    () => [
      {
        accessorKey: 'display_name',
        header: 'Role Name',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.display_name}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400 line-clamp-2">
            {row.original.description || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) => (
          row.original.is_default ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Default
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">-</span>
          )
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          row.original.is_active ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircleIcon className="h-3.5 w-3.5" />
              Inactive
            </span>
          )
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {row.original.created_at
              ? format(new Date(row.original.created_at), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const canDelete = canDeleteRole(row.original);
          const tooltipText = !canDelete 
            ? 'Cannot delete protected role' 
            : row.original.is_default 
              ? 'Cannot delete default role' 
              : 'Delete role';
          
          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => router.push(`/roles-management/${row.original.id}`)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary"
                title="Edit role"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              {canDelete && !row.original.is_default ? (
                <button
                  onClick={() => openDeleteModal(row.original.id)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title={tooltipText}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  disabled
                  className="rounded-lg p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  title={tooltipText}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [router]
  );

  // Define filter fields
  const filterFields: FilterField[] = [
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      key: 'name',
      label: 'Role Name',
      type: 'text',
    },
  ];

  // Calculate page count
  const pageCount = data?.total ? Math.ceil(data.total / pageSize) : 0;

  if (error) {
    return (
      <Navigation>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Error: {error instanceof Error ? error.message : 'Failed to fetch roles'}
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <DataTable<RoleResponse>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        title="Roles Management"
        description="Manage user roles and permissions in your application."
        // Pagination
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        total={data?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        // Search
        searchPlaceholder="Search roles..."
        onSearch={handleSearch}
        // Sorting
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSortChange={handleSortChange}
        // Filtering
        filterFields={filterFields}
        filters={filters}
        onFilterChange={handleFilterChange}
        // Actions
        onAdd={() => router.push('/roles-management/add')}
        addButtonText="Add Role"
        // Empty state
        emptyState={
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No roles found
            </p>
            <button
              onClick={() => router.push('/roles-management/add')}
              className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
            >
              Create your first role
            </button>
          </div>
        }
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        description="Are you sure you want to delete this role? Users with this role will need to be reassigned."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Navigation>
  );
}
