'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FormCard, FormSection, FormRow, FormActions } from '@/components/ui/FormCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { useCreateMenu, useGetMenuTree } from '@/hooks/useMenu';
import { MenuResponse } from '@/services/menuService';
import toast from 'react-hot-toast';

export default function AddMenuPage() {
  const router = useRouter();
  const createMenu = useCreateMenu();
  const { data: menuTree, isLoading: menusLoading } = useGetMenuTree();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    path: '',
    icon: '',
    order_index: 0,
    parent_id: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Flatten menu tree for parent selection
  const flattenMenus = (menus: MenuResponse[], prefix = ''): { value: string; label: string }[] => {
    let result: { value: string; label: string }[] = [];
    menus.forEach((menu) => {
      result.push({
        value: menu.id.toString(),
        label: prefix + menu.name,
      });
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenMenus(menu.children, prefix + menu.name + ' > '));
      }
    });
    return result;
  };

  const parentOptions = [
    { value: '', label: 'None (Root Menu)' },
    ...(menuTree ? flattenMenus(menuTree) : []),
  ];

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

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
      await createMenu.mutateAsync({
        name: formData.name,
        path: formData.path,
        icon: formData.icon,
        order_index: formData.order_index,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        is_active: formData.is_active,
      });

      toast.success('Menu created successfully');
      router.push('/menus-management');
    } catch (error) {
      console.error('Create failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/menus-management');
  };

  return (
    <Navigation>
      <form onSubmit={handleSubmit}>
        <FormCard
          title="Create New Menu"
          description="Add a new menu item to your application's navigation system."
          actions={
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Menu'}
              </PrimaryButton>
            </FormActions>
          }
        >
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
                  disabled={menusLoading}
                  placeholder="Select parent menu"
                  helperText="Leave empty for root-level menu"
                />
                <Select
                  label="Status"
                  name="is_active"
                  options={statusOptions}
                  value={formData.is_active.toString()}
                  onChange={handleStatusChange}
                  placeholder="Select status"
                  helperText="Inactive menus won't appear in navigation"
                  required
                />
              </FormRow>
            </FormSection>
          </div>
        </FormCard>
      </form>
    </Navigation>
  );
}
