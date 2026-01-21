'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FormCard, FormSection, FormRow, FormActions } from '@/components/ui/FormCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { MenuPermissionsEditor, MenuPermission } from '@/components/ui/MenuPermissionsEditor';
import { useGetUserById, useUpdateUser } from '@/hooks/useUser';
import { useGetActiveRoles } from '@/hooks/useRole';
import {
  useGetMenuTree,
  useGetRoleMenus,
  useGetUserRightsAccess,
  useBulkSaveUserRightsAccess,
} from '@/hooks/useMenu';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { data: user, isLoading, error } = useGetUserById(params.id);
  const { data: roles, isLoading: rolesLoading } = useGetActiveRoles();
  const { data: menuTree, isLoading: menusLoading } = useGetMenuTree();
  const updateUser = useUpdateUser();
  const bulkSaveRightsAccess = useBulkSaveUserRightsAccess();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use ref to store permissions to avoid unnecessary re-renders
  const permissionsRef = useRef<MenuPermission[]>([]);

  // Get the selected role's ID for fetching role menus
  const selectedRole = roles?.find((r) => r.name === formData.role);
  const { data: roleMenus, isLoading: roleMenusLoading } = useGetRoleMenus(selectedRole?.id);

  // Get user's existing rights access
  const userId = user?.id ? Number(user.id) : undefined;
  const { data: userRightsAccess, isLoading: rightsLoading } = useGetUserRightsAccess(userId);

  // Convert roles to select options
  const roleOptions =
    roles?.map((role) => ({
      value: role.name,
      label: role.display_name,
    })) || [];

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        password: '',
        role: user.role?.name || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const handlePermissionsChange = useCallback((newPermissions: MenuPermission[]) => {
    permissionsRef.current = newPermissions;
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Update user info
      await updateUser.mutateAsync({
        id: params.id,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role_id: selectedRole?.id || 0,
      });

      // Save ONLY custom permission overrides (not inherited ones)
      // Filter to only include permissions with at least one custom override
      const customPermissions = permissionsRef.current.filter((p) => p.isCustomized);

      if (userId && customPermissions.length > 0) {
        const permissionsToSave = customPermissions.map((p) => ({
          menu_id: p.menuId,
          can_read: p.canRead,       // nullable: null = inherit, true/false = override
          can_write: p.canWrite,     // nullable: null = inherit, true/false = override
          can_update: p.canUpdate,   // nullable: null = inherit, true/false = override
          can_delete: p.canDelete,   // nullable: null = inherit, true/false = override
        }));

        await bulkSaveRightsAccess.mutateAsync({
          userId,
          permissions: permissionsToSave,
        });
      } else if (userId && customPermissions.length === 0) {
        // If no custom permissions, delete all overrides (user will inherit from role)
        await bulkSaveRightsAccess.mutateAsync({
          userId,
          permissions: [],
        });
      }

      toast.success('User updated successfully');
      router.push('/users-management');
    } catch (error) {
      console.error('Update failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Just navigate back without saving
    router.push('/users-management');
  };

  if (error) {
    return (
      <Navigation>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Error: {error instanceof Error ? error.message : 'Failed to fetch user'}
        </div>
      </Navigation>
    );
  }

  // Check if user has permission to edit
  // 1. Role-based check: root or admin roles have full access
  const isRootOrAdmin = currentUser?.role?.name === 'root' || currentUser?.role?.name === 'admin';

  // 2. Permission-based check: user has explicit UPDATE permission on users-management menu
  // Note: This checks the current user's permissions, not the user being edited
  // For now, we'll just use role-based check until we fetch current user's permissions
  const canEdit = isRootOrAdmin;

  const isDataLoading = isLoading || menusLoading || rolesLoading;
  const isPermissionsLoading = roleMenusLoading || rightsLoading;

  return (
    <Navigation>
      <form onSubmit={handleSubmit}>
        <FormCard
          title={isLoading ? 'Loading...' : `Edit User: ${user?.name}`}
          description="Update user information, credentials, and permissions."
          actions={
            canEdit ? (
              <FormActions>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </FormActions>
            ) : undefined
          }
        >
          {isDataLoading ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <Skeleton height={20} width={150} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Skeleton height={70} />
                  <Skeleton height={70} />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton height={20} width={150} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Skeleton height={70} />
                  <Skeleton height={70} />
                </div>
                <Skeleton height={70} />
              </div>
              <div className="space-y-6">
                <Skeleton height={20} width={150} />
                <Skeleton height={200} />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <FormSection
                title="Personal Information"
                description="Basic information about the user."
              >
                <FormRow columns={2}>
                  <Input
                    id="name"
                    name="name"
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={!canEdit}
                    required
                  />
                </FormRow>
              </FormSection>

              <FormSection
                title="Account Details"
                description="Login credentials and role assignment."
              >
                <FormRow columns={2}>
                  <Input
                    id="username"
                    name="username"
                    label="Username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    helperText="Must be unique. Used for login."
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    helperText="Leave blank to keep current password."
                    disabled={!canEdit}
                  />
                </FormRow>

                <FormRow>
                  <Select
                    label="Role"
                    name="role"
                    options={roleOptions}
                    value={formData.role}
                    onChange={handleRoleChange}
                    error={errors.role}
                    disabled={!canEdit || rolesLoading}
                    placeholder="Select a role"
                    required
                  />
                </FormRow>
              </FormSection>

              {/* Menu Permissions Section */}
              {formData.role && canEdit && (
                <FormSection
                  title="Menu Permissions"
                  description="Customize menu access for this user. By default, permissions are inherited from the selected role. Click on any permission to customize it."
                >
                  <MenuPermissionsEditor
                    roleMenus={roleMenus || []}
                    allMenus={menuTree || []}
                    userRightsAccess={userRightsAccess || []}
                    isLoading={isPermissionsLoading}
                    onChange={handlePermissionsChange}
                    disabled={isSubmitting || !canEdit}
                  />
                </FormSection>
              )}

              {!canEdit && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  You don&apos;t have permission to edit this user.
                </div>
              )}
            </div>
          )}
        </FormCard>
      </form>
    </Navigation>
  );
}
