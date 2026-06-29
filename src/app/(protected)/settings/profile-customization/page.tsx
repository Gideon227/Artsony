'use client'

import { Navbar } from "@/components/layout/navbar"
import ProfileCustomization from "@/features/settings/components/profile-customization"
import SettingLeftBar from "@/features/settings/components/settings-left-bar"

const ProfileCustomizationPage = () => {
    return (
        <>
            <Navbar />
            <div className='px-8 py-6 flex gap-x-4 bg-white'>
                <SettingLeftBar />
                <ProfileCustomization />
            </div>
        </>
    )
}

export default ProfileCustomizationPage