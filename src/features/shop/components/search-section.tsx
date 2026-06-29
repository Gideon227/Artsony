'use client'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { SearchInput } from '@/components/ui/search-input'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const searchOptions: DropdownOption[] = [
    { 
        id: 'for-you', 
        label: 'For You', 
    },
    { 
        id: 'everyone', 
        label: 'Everyone', 
    },
]

const priceOptions = [
    {
        id: '0-1k',
        label: '0 - 1K'
    },
    {
        id: '10K-50K',
        label: '10K - 50K'
    },
    {
        id: '50K-100k',
        label: '50K - 100K'
    },
    {
        id: '100k+',
        label: '100K+'
    },

]


const SearchSection = () => {
    const router = useRouter()
    const [localQuery, setLocalQuery] = useState('')
    const [selected, setSelected] = useState<DropdownOption | undefined>();

    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<any>(null);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    const categoriesOption: DropdownOption[] = INTERESTS.map((item) => ({
        id: item.id,
        icon: item.image,
        label: item.label
    }))

    const handleSearch = (q: string) => {
        const trimmed = q.trim()
        if (!trimmed) return

        setLocalQuery('')
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedColor(null);
        setSelectedPrice(null);
        setSelectedLocation(null);
    }

    const filterDropdowns: FilterDropdownConfig[] = [
        {
          id: 'category',
          options: categoriesOption,
          value: selectedCategory,
          onChange: (val) => setSelectedCategory(val),
          placeholder: 'Categories',
          leftIcon: '/icons/widget.svg'
        },
        {
          id: 'price',
          options: priceOptions, 
          value: selectedPrice,
          onChange: (val) => setSelectedPrice(val),
          placeholder: 'Price',
          leftIcon: '/icons/palette.svg'
        },
        {
          id: 'color',
          options: categoriesOption, 
          value: selectedColor,
          onChange: (val) => setSelectedColor(val),
          placeholder: 'Color',
          leftIcon: '/icons/palette.svg'
        },
        {
          id: 'size',
          options: categoriesOption, // Replace with actual location options later
          value: selectedSize,
          onChange: (val) => setSelectedSize(val),
          placeholder: 'Size',
          leftIcon: '/icons/map-point.svg'
        },
        {
          id: 'location',
          options: categoriesOption, // Replace with actual location options later
          value: selectedLocation,
          onChange: (val) => setSelectedLocation(val),
          placeholder: 'Location',
          leftIcon: '/icons/map-point.svg'
        },
    ]
    
    return (
        <>
            <div className='pt-12 px-8 flex justify-between items-center bg-white'>
                <SearchInput 
                    value={localQuery}
                    onChange={setLocalQuery}
                    onSearch={handleSearch}
                    placeholder="Find your next art obsession"
                    leftIconPath="/home/magnifier.svg"
                    className='w-md '
                />

                <Dropdown
                    options={searchOptions}
                    value={selected}
                    onChange={(option) => setSelected(option)}
                    placeholder="For You"
                    className='w-67'
                />
            </div>
        
            <div className='py-8 px-6 bg-white'>
                <FilterComponent 
                    dropdowns={filterDropdowns}
                    onClear={handleClearFilters}
                />
            </div>
        </>
    )
}

export default SearchSection