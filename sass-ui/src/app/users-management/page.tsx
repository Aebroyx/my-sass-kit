'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { Navigation } from '@/components/Navigation';
import { DataTable, FilterField } from '@/components/ui/DataTable';
import DeleteModal from '@/components/modals/DeleteModal';
import { useDeleteUser, useGetAllUsers } from '@/hooks/useUser';
import { GetUserResponse } from '@/services/userService';
import { useDebounce } from '@/hooks/useDebounce';

// Helper function to check if user can be deleted
const canDeleteUser = (user: GetUserResponse): boolean => {
  // Prevent deletion of root user only
  if (user.username === 'root' || user.email === 'root@localhost') {
    return false;
  }
  
  return true;
};

export default function UsersManagementPage() {
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

  // Fetch users data
  const { data, isLoading, error } = useGetAllUsers({
    page,
    pageSize,
    search,
    sortBy,
    sortDesc,
    filters,
  });

  // Delete user mutation
  const deleteUser = useDeleteUser();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Handlers
  const openDeleteModal = (id: number) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    handleDelete(userToDelete);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy: string, newSortDesc: boolean) => {
    setSortBy(newSortBy);
    setSortDesc(newSortDesc);
  };

  // Define table columns using TanStack Table format
  const columns = useMemo<ColumnDef<GetUserResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary dark:bg-primary/20">
            {row.original.role?.display_name || row.original.role?.name || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {row.original.created_at
              ? format(new Date(row.original.created_at), 'yyyy-MM-dd HH:mm')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {row.original.updated_at
              ? format(new Date(row.original.updated_at), 'yyyy-MM-dd HH:mm')
              : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const canDelete = canDeleteUser(row.original);
          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => router.push(`/users-management/${row.original.id}`)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary"
                title="View user"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              {canDelete ? (
                <button
                  onClick={() => openDeleteModal(row.original.id)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Delete user"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  disabled
                  className="rounded-lg p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  title="This user cannot be deleted"
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
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
    },
    {
      key: 'username',
      label: 'Username',
      type: 'text',
    },
  ];

  // Calculate page count
  const pageCount = data?.total ? Math.ceil(data.total / pageSize) : 0;

  if (error) {
    return (
      <Navigation>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Error: {error instanceof Error ? error.message : 'Failed to fetch users'}
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <DataTable<GetUserResponse>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        title="Users Management"
        description="A list of all users in your application including their name, email, and role."
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
        searchPlaceholder="Search users..."
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
        onAdd={() => router.push('/users-management/add')}
        addButtonText="Add User"
        // Empty state
        emptyState={
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No users found
            </p>
            <button
              onClick={() => router.push('/users-management/add')}
              className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
            >
              Add your first user
            </button>
          </div>
        }
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Navigation>
  );
}
