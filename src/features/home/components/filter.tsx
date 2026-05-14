import { Button } from '@/components';
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import React from 'react'

// Export this interface so the parent component can use it
export interface FilterDropdownConfig {
    id: string | number;
    options: DropdownOption[];
    value: any; 
    onChange: (val: any) => void;
    placeholder: string;
    leftIcon: string;
}

interface FilterComponentProps {
    dropdowns: FilterDropdownConfig[];
    onClear: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ dropdowns, onClear }) => {
    return (
        <div className='max-md:hidden py-6 px-8 flex gap-[132px] flex-1 items-center border-b border-gray-50 bg-white'>
            <div className='flex flex-1 gap-x-4 items-center'>
                {dropdowns?.map((item) => (
                    <Dropdown
                        key={item.id}
                        options={item.options}
                        value={item.value}
                        onChange={item.onChange}
                        placeholder={item.placeholder}
                        leftIcon={item.leftIcon}
                    />
                ))}
            </div>

            <Button
                variant="outline"
                onClick={onClear}
            >
                Clear Fields
            </Button>
        </div>
    )
}

export default FilterComponent;