'use client';

import { ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface FormCardProps {
  title: string;
  description?: string;
  backHref?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function FormCard({
  title,
  description,
  backHref,
  children,
  actions,
}: FormCardProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Form Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 sm:p-8">
          {children}
        </div>

        {/* Actions Footer */}
        {actions && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50 sm:px-8">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
          {title && (
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

interface FormRowProps {
  children: ReactNode;
  columns?: 1 | 2;
}

export function FormRow({ children, columns = 1 }: FormRowProps) {
  return (
    <div className={`grid gap-6 ${columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      {children}
    </div>
  );
}
