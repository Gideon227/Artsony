import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import React from 'react'

const SearchPage = () => {
    return (
        <div className='min-h-screen bg-white'>
            <Navbar hideSearchBar={true} />


            
            <Footer />
        </div>
    )
}

export default SearchPage