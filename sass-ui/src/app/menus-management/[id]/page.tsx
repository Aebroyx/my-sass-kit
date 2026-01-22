'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FormCard, FormSection, FormRow, FormActions } from '@/components/ui/FormCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { useGetMenuById, useUpdateMenu, useGetMenuTree } from '@/hooks/useMenu';
import { MenuResponse } from '@/services/menuService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { data: menu, isLoading, error } = useGetMenuById(params.id);
  const { data: menuTree, isLoading: menusLoading } = useGetMenuTree();
  const updateMenu = useUpdateMenu();

  const [formData, setFormData] = useState({
    name: '',
    path: '',
    icon: '',
    order_index: 0,
    parent_id: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten menu tree for parent selection (exclude current menu and its descendants)
  const flattenMenus = (
    menus: MenuResponse[],
    prefix = '',
    excludeId?: number
  ): { value: string; label: string }[] => {
    let result: { value: string; label: string }[] = [];
    menus.forEach((menu) => {
      if (menu.id !== excludeId) {
        result.push({
          value: menu.id.toString(),
          label: prefix + menu.name,
        });
        if (menu.children && menu.children.length > 0) {
          result = result.concat(
            flattenMenus(menu.children, prefix + menu.name + ' > ', excludeId)
          );
        }
      }
    });
    return result;
  };

  const parentOptions = [
    { value: '', label: 'None (Root Menu)' },
    ...(menuTree ? flattenMenus(menuTree, '', menu?.id) : []),
  ];

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  // Populate form when menu data loads
  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        order_index: menu.order_index,
        parent_id: menu.parent_id ? menu.parent_id.toString() : '',
        is_active: menu.is_active,
      });
    }
  }, [menu]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleParentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, parent_id: value }));
    if (errors.parent_id) {
      setErrors((prev) => ({ ...prev, parent_id: '' }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, is_active: value === 'true' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.path.trim()) newErrors.path = 'Path is required';
    else if (!formData.path.startsWith('/')) newErrors.path = 'Path must start with /';
    if (!formData.icon.trim()) newErrors.icon = 'Icon is required';
    if (formData.order_index < 0) newErrors.order_index = 'Order must be a positive number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateMenu.mutateAsync({
        id: params.id,
        name: formData.name,
        path: formData.path,
        icon: formData.icon,
        order_index: formData.order_index,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        is_active: formData.is_active,
      });

      toast.success('Menu updated successfully');
      router.push('/menus-management');
    } catch (error) {
      console.error('Update failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/menus-management');
  };

  if (error) {
    return (
      <Navigation>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Error: {error instanceof Error ? error.message : 'Failed to fetch menu'}
        </div>
      </Navigation>
    );
  }

  const canEdit = currentUser?.role?.name === 'root' || currentUser?.role?.name === 'admin';
  const isDataLoading = isLoading || menusLoading;

  return (
    <Navigation>
      <form onSubmit={handleSubmit}>
        <FormCard
          title={isLoading ? 'Loading...' : `Edit Menu: ${menu?.name}`}
          description="Update menu information and settings."
          actions={
            canEdit ? (
              <FormActions>
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
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
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <FormSection
                title="Menu Information"
                description="Basic details about the menu item."
              >
                <FormRow columns={2}>
                  <Input
                    id="name"
                    name="name"
                    label="Menu Name"
                    placeholder="Dashboard"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    helperText="Display name shown in navigation"
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    id="path"
                    name="path"
                    label="Path"
                    placeholder="/dashboard"
                    value={formData.path}
                    onChange={handleChange}
                    error={errors.path}
                    helperText="URL path for this menu item"
                    disabled={!canEdit}
                    required
                  />
                </FormRow>

                <FormRow columns={2}>
                  <Input
                    id="icon"
                    name="icon"
                    label="Icon"
                    placeholder="HomeIcon"
                    value={formData.icon}
                    onChange={handleChange}
                    error={errors.icon}
                    helperText="Heroicons icon name (e.g., HomeIcon)"
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    id="order_index"
                    name="order_index"
                    type="number"
                    label="Order Index"
                    placeholder="0"
                    value={formData.order_index.toString()}
                    onChange={handleChange}
                    error={errors.order_index}
                    helperText="Display order (lower numbers appear first)"
                    disabled={!canEdit}
                    required
                  />
                </FormRow>
              </FormSection>

              <FormSection
                title="Menu Hierarchy"
                description="Configure parent menu and visibility settings."
              >
                <FormRow columns={2}>
                  <Select
                    label="Parent Menu"
                    name="parent_id"
                    options={parentOptions}
                    value={formData.parent_id}
                    onChange={handleParentChange}
                    disabled={!canEdit || menusLoading}
                    placeholder="Select parent menu"
                    helperText="Leave empty for root-level menu"
                  />
                  <Select
                    label="Status"
                    name="is_active"
                    options={statusOptions}
                    value={formData.is_active.toString()}
                    onChange={handleStatusChange}
                    disabled={!canEdit}
                    placeholder="Select status"
                    helperText="Inactive menus won't appear in navigation"
                    required
                  />
                </FormRow>
              </FormSection>

              {!canEdit && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  You don&apos;t have permission to edit this menu.
                </div>
              )}
            </div>
          )}
        </FormCard>
      </form>
    </Navigation>
  );
}
