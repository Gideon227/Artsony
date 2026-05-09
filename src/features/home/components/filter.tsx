import { Button } from '@/components';
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import React from 'react'
import { INTERESTS } from '@/features/onboarding/data/interests'


interface Options {
    id: number
    options: DropdownOption[];
    value: any;
    onChange: () => void
    placeholder: string
    leftIcon: string

}

const FilterComponent = () => {

    const categoriesOption: DropdownOption[] = INTERESTS.map((item) => ({
        id: item.id,
        icon: item.image,
        label: item.label
    }))

    const dropdownData: Options[] = [
        {
            id: 0,
            options: categoriesOption,
            value: null,
            onChange: () => {},
            placeholder: 'Categories',
            leftIcon: '/icons/widget.svg'
        },
        {
            id: 0,
            options: categoriesOption,
            value: null,
            onChange: () => {},
            placeholder: 'Color',
            leftIcon: '/icons/palette.svg'
        },
        {
            id: 0,
            options: categoriesOption,
            value: null,
            onChange: () => {},
            placeholder: 'Location',
            leftIcon: '/icons/map-point.svg'
        },
    ]

    const clearField = () => {

    }


    return (
        <div className='max-md:hidden py-6 px-8 flex gap-[132px] flex-1 items-center border-b border-gray-50 bg-white'>
            <div className='flex flex-1 gap-x-4 items-center'>
                {dropdownData?.map((item) => (
                    <Dropdown
                        options={item.options}
                        value={item.value}
                        onChange={item.onChange}
                        placeholder={item.placeholder}
                        leftIcon={item.leftIcon}
                        key={item.id}
                    />
                ))}
            </div>

            <Button
                variant= "outline"
                onClick={() => clearField()}

            >Clear Fields</Button>

        </div>
    )
}

export default FilterComponent