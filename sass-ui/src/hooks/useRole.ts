import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, GetAllRolesParams, CreateRoleRequest, UpdateRoleRequest, RoleMenuPermission } from '@/services/roleService';
import toast from 'react-hot-toast';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params: GetAllRolesParams) => [...roleKeys.lists(), params] as const,
  active: () => [...roleKeys.all, 'active'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...roleKeys.details(), id] as const,
};

// Get all roles with pagination
export function useGetAllRoles(params: GetAllRolesParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleService.getAllRoles(params),
    placeholderData: (previousData) => previousData,
  });
}

// Get active roles for dropdowns
export function useGetActiveRoles() {
  return useQuery({
    queryKey: roleKeys.active(),
    queryFn: () => roleService.getActiveRoles(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Get role by ID
export function useGetRoleById(id: string | number) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
  });
}

// Create role mutation
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      // Note: Toast and redirect handled by the calling component
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create role';
      toast.error(errorMessage);
    },
  });
}

// Update role mutation
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRoleRequest & { id: string | number }) =>
      roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      // Note: Toast and redirect handled by the calling component
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update role';
      toast.error(errorMessage);
    },
  });
}

// Delete role mutation
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success('Role deleted successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to delete role';
      toast.error(errorMessage);
    },
  });
}

// Bulk assign menus to role mutation
export function useBulkAssignMenusToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: RoleMenuPermission[] }) =>
      roleService.bulkAssignMenusToRole(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success('Menu permissions saved successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to save menu permissions';
      toast.error(errorMessage);
    },
  });
}
