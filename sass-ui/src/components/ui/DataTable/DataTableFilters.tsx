'use client';

import { useState, Fragment } from 'react';
import { FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { DataTableFiltersProps } from './types';

export function DataTableFilters({
  filterFields,
  filters,
  onFilterChange
}: DataTableFiltersProps) {
  const [selectedField, setSelectedField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const activeFiltersCount = Object.keys(filters).length;

  // Get current field config
  const currentField = filterFields.find(f => f.key === selectedField);

  const handleAddFilter = () => {
    if (!selectedField || !filterValue) return;

    const newFilters = {
      ...filters,
      [selectedField]: filterValue
    };
    onFilterChange(newFilters);
    setSelectedField('');
    setFilterValue('');
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  const getFieldLabel = (key: string): string => {
    const field = filterFields.find(f => f.key === key);
    return field?.label || key;
  };

  const getValueLabel = (key: string, value: string): string => {
    const field = filterFields.find(f => f.key === key);
    if (field?.type === 'select' && field.options) {
      const option = field.options.find(o => o.value === value);
      return option?.label || value;
    }
    return value;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active Filter Pills */}
      {Object.entries(filters).map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary dark:bg-primary/20"
        >
          <span className="text-gray-600 dark:text-gray-400">{getFieldLabel(key)}:</span>
          <span>{getValueLabel(key, value)}</span>
          <button
            type="button"
            onClick={() => handleRemoveFilter(key)}
            className="ml-1 rounded-full p-0.5 hover:bg-primary/20 dark:hover:bg-primary/30"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}

      {/* Clear All Button */}
      {activeFiltersCount > 1 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear all
        </button>
      )}

      {/* Add Filter Popover */}
      <Popover className="relative">
        {({ close }) => (
          <>
            <PopoverButton as={SecondaryButton} className="inline-flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </PopoverButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel className="absolute left-0 z-10 mt-2 w-80 origin-top-left rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-card-bg dark:ring-border-dark">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Add Filter
                  </h3>

                  {/* Field Select */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Field
                    </label>
                    <select
                      value={selectedField}
                      onChange={(e) => {
                        setSelectedField(e.target.value);
                        setFilterValue('');
                      }}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-input-bg dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {filterFields
                        .filter(f => !filters[f.key])
                        .map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  {selectedField && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Value
                      </label>
                      {currentField?.type === 'select' && currentField.options ? (
                        <select
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-input-bg dark:text-white"
                        >
                          <option value="">Select value...</option>
                          {currentField.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : currentField?.type === 'date' ? (
                        <input
                          type="date"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-input-bg dark:text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          placeholder="Enter value..."
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-input-bg dark:text-white"
                        />
                      )}
                    </div>
                  )}

                  {/* Add Button */}
                  <PrimaryButton
                    type="button"
                    onClick={() => {
                      handleAddFilter();
                      close();
                    }}
                    disabled={!selectedField || !filterValue}
                    fullWidth
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Filter
                  </PrimaryButton>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
