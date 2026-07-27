import { Button } from '@/components';
import {
  Dropdown,
  DropdownOption,
  DropdownIndicator,
  DropdownLayout,
  DropdownSearchVariant,
} from '@/components/ui/dropdown'
import React from 'react'

// Export this interface so the parent component can use it
export interface FilterDropdownConfig {
  id: string | number;
  options: DropdownOption[];
  placeholder: string;
  leftIcon: string;

  // Single-select (default)
  value?: DropdownOption | null;
  onChange?: (val: DropdownOption) => void;

  // Multi-select (categories)
  multiple?: boolean;
  values?: DropdownOption[];
  onChangeMultiple?: (vals: DropdownOption[]) => void;
  maxSelected?: number;

  // Search (location / color)
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchVariant?: DropdownSearchVariant;
  onSearchSubmit?: () => void;

  // Rendering
  layout?: DropdownLayout;
  indicator?: DropdownIndicator;
  isLoading?: boolean;
  emptyMessage?: string;

  // Custom body (e.g. price range slider)
  customBody?: React.ReactNode;
  valueLabel?: string;
}

interface FilterComponentProps {
  dropdowns: FilterDropdownConfig[];
  onClear: () => void;
  hideClearButton?: boolean;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ dropdowns, onClear, hideClearButton = false }) => {
  return (
    <div className='max-md:hidden py-6 flex gap-x-4 flex-1 items-center bg-white max-w-[1440px] mx-auto'>
      <div className='flex flex-1 gap-x-4 items-center'>
        {dropdowns?.map((item) => (
          <Dropdown
            key={item.id}
            options={item.options}
            value={item.value ?? undefined}
            onChange={item.onChange}
            multiple={item.multiple}
            values={item.values}
            onChangeMultiple={item.onChangeMultiple}
            maxSelected={item.maxSelected}
            placeholder={item.placeholder}
            leftIcon={item.leftIcon}
            searchable={item.searchable}
            searchPlaceholder={item.searchPlaceholder}
            searchValue={item.searchValue}
            onSearchChange={item.onSearchChange}
            searchVariant={item.searchVariant}
            onSearchSubmit={item.onSearchSubmit}
            layout={item.layout}
            indicator={item.indicator}
            isLoading={item.isLoading}
            emptyMessage={item.emptyMessage}
            customBody={item.customBody}
            valueLabel={item.valueLabel}
          />
        ))}
      </div>

      {!hideClearButton && (
        <Button
          variant="outline"
          onClick={onClear}
        >
          Clear Fields
        </Button>
      )}
    </div>
  )
}

export default FilterComponent;