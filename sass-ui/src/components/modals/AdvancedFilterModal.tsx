'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, TrashIcon, Bars2Icon, PlusIcon } from '@heroicons/react/24/outline';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';

// Operator types for different field types
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'is'
  | 'isNot'
  | 'isEmpty'
  | 'isNotEmpty';

export type FilterLogic = 'and' | 'or';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
  logic: FilterLogic;
}

export interface FilterFieldOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: { value: string; label: string }[];
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (conditions: FilterCondition[]) => void;
  fields: FilterFieldOption[];
  initialConditions?: FilterCondition[];
}

// Get available operators based on field type
const getOperatorsForFieldType = (type: string): { value: FilterOperator; label: string }[] => {
  const commonOperators = [
    { value: 'isEmpty' as FilterOperator, label: 'Is empty' },
    { value: 'isNotEmpty' as FilterOperator, label: 'Is not empty' },
  ];

  switch (type) {
    case 'text':
      return [
        { value: 'equals' as FilterOperator, label: 'Equals' },
        { value: 'notEquals' as FilterOperator, label: 'Not equals' },
        { value: 'contains' as FilterOperator, label: 'Contains' },
        { value: 'notContains' as FilterOperator, label: 'Not contains' },
        { value: 'startsWith' as FilterOperator, label: 'Starts with' },
        { value: 'endsWith' as FilterOperator, label: 'Ends with' },
        ...commonOperators,
      ];
    case 'number':
      return [
        { value: 'equals' as FilterOperator, label: 'Equals' },
        { value: 'notEquals' as FilterOperator, label: 'Not equals' },
        { value: 'greaterThan' as FilterOperator, label: 'Greater than' },
        { value: 'lessThan' as FilterOperator, label: 'Less than' },
        { value: 'greaterThanOrEqual' as FilterOperator, label: 'Greater than or equal' },
        { value: 'lessThanOrEqual' as FilterOperator, label: 'Less than or equal' },
        ...commonOperators,
      ];
    case 'date':
      return [
        { value: 'equals' as FilterOperator, label: 'Is' },
        { value: 'notEquals' as FilterOperator, label: 'Is not' },
        { value: 'greaterThan' as FilterOperator, label: 'After' },
        { value: 'lessThan' as FilterOperator, label: 'Before' },
        { value: 'greaterThanOrEqual' as FilterOperator, label: 'On or after' },
        { value: 'lessThanOrEqual' as FilterOperator, label: 'On or before' },
        ...commonOperators,
      ];
    case 'select':
    case 'boolean':
      return [
        { value: 'is' as FilterOperator, label: 'Is' },
        { value: 'isNot' as FilterOperator, label: 'Is not' },
        ...commonOperators,
      ];
    default:
      return [
        { value: 'equals' as FilterOperator, label: 'Equals' },
        { value: 'contains' as FilterOperator, label: 'Contains' },
        ...commonOperators,
      ];
  }
};

// Check if operator requires a value input
const operatorNeedsValue = (operator: FilterOperator): boolean => {
  return !['isEmpty', 'isNotEmpty'].includes(operator);
};

export default function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  fields,
  initialConditions = [],
}: AdvancedFilterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  // Initialize conditions when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialConditions.length > 0) {
        setConditions(initialConditions);
      } else {
        // Start with one empty condition
        setConditions([
          {
            id: crypto.randomUUID(),
            field: '',
            operator: 'equals',
            value: '',
            logic: 'and',
          },
        ]);
      }
    }
  }, [isOpen, initialConditions]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        id: crypto.randomUUID(),
        field: '',
        operator: 'equals',
        value: '',
        logic: 'and',
      },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === id) {
          const updatedCondition = { ...c, ...updates };
          
          // Reset operator if field type changes
          if (updates.field !== undefined && updates.field !== c.field) {
            const field = fields.find((f) => f.key === updates.field);
            if (field) {
              const availableOperators = getOperatorsForFieldType(field.type);
              updatedCondition.operator = availableOperators[0].value;
              updatedCondition.value = '';
            }
          }
          
          return updatedCondition;
        }
        return c;
      })
    );
  };

  const handleApply = () => {
    // Filter out incomplete conditions
    const validConditions = conditions.filter(
      (c) => c.field && c.operator && (operatorNeedsValue(c.operator) ? c.value : true)
    );
    onApply(validConditions);
    onClose();
  };

  const handleReset = () => {
    setConditions([
      {
        id: crypto.randomUUID(),
        field: '',
        operator: 'equals',
        value: '',
        logic: 'and',
      },
    ]);
    onApply([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card-bg rounded-lg shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-border-dark px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Customize table
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select and add conditions
          </p>

          {/* Conditions */}
          <div className="space-y-3">
            {conditions.map((condition, index) => {
              const selectedField = fields.find((f) => f.key === condition.field);
              const availableOperators = selectedField
                ? getOperatorsForFieldType(selectedField.type)
                : [];
              const needsValue = operatorNeedsValue(condition.operator);

              return (
                <div key={condition.id}>
                  {/* Show AND/OR selector for conditions after the first */}
                  {index > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bars2Icon className="h-5 w-5 text-gray-400" />
                      <select
                        value={condition.logic}
                        onChange={(e) =>
                          handleUpdateCondition(condition.id, {
                            logic: e.target.value as FilterLogic,
                          })
                        }
                        className="rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="and">and</option>
                        <option value="or">or</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {/* Drag handle */}
                    <div className="flex-shrink-0">
                      <Bars2Icon className="h-5 w-5 text-gray-400 cursor-move" />
                    </div>

                    {/* Where label */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Where
                    </div>

                    {/* Field selector */}
                    <select
                      value={condition.field}
                      onChange={(e) =>
                        handleUpdateCondition(condition.id, { field: e.target.value })
                      }
                      className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select field</option>
                      {fields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    {/* Operator selector */}
                    <select
                      value={condition.operator}
                      onChange={(e) =>
                        handleUpdateCondition(condition.id, {
                          operator: e.target.value as FilterOperator,
                        })
                      }
                      disabled={!condition.field}
                      className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {availableOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {/* Value input */}
                    {needsValue && (
                      <>
                        {selectedField?.type === 'select' || selectedField?.type === 'boolean' ? (
                          <select
                            value={condition.value}
                            onChange={(e) =>
                              handleUpdateCondition(condition.id, { value: e.target.value })
                            }
                            disabled={!condition.field}
                            className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select value</option>
                            {selectedField?.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : selectedField?.type === 'date' ? (
                          <input
                            type="date"
                            value={condition.value}
                            onChange={(e) =>
                              handleUpdateCondition(condition.id, { value: e.target.value })
                            }
                            disabled={!condition.field}
                            className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        ) : selectedField?.type === 'number' ? (
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(e) =>
                              handleUpdateCondition(condition.id, { value: e.target.value })
                            }
                            disabled={!condition.field}
                            placeholder="Enter value"
                            className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        ) : (
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) =>
                              handleUpdateCondition(condition.id, { value: e.target.value })
                            }
                            disabled={!condition.field}
                            placeholder="Enter value"
                            className="flex-1 rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-input-bg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
                      </>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add condition button */}
          <button
            onClick={handleAddCondition}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            <PlusIcon className="h-5 w-5" />
            Add conditions
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-border-dark px-6 py-4">
          <SecondaryButton onClick={handleReset} variant="danger">
            Clear all
          </SecondaryButton>
          <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
