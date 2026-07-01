'use client'

import { Navbar } from "@/components/layout/navbar"
import AccountDetails from "@/features/settings/components/account-details"
import BillingPayment from "@/features/settings/components/billing-payment"
import NotificationSettings from "@/features/settings/components/notification"
import PrivacySafety from "@/features/settings/components/privacy-safety"
import ProfileCustomization from "@/features/settings/components/profile-customization"
import Security from "@/features/settings/components/security"
import SettingLeftBar from "@/features/settings/components/settings-left-bar"
import ShippingLocation from "@/features/settings/components/shipping-location"
import { useState } from "react"

const ProfileCustomizationPage = () => {
    const [activeTab, setActiveTab] = useState<string>("personal")

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "personal":
                return <ProfileCustomization />
            case "account":
                return <AccountDetails />
            case "privacy-safety":
                return <PrivacySafety />
            case "security":
                return <Security />
            case "notification":
                return <NotificationSettings />
            case "payment":
                return <BillingPayment />
            case "shipping-location":
                return <ShippingLocation />
            default:
                return <ProfileCustomization />
        }
    }

    return (
        <>
            <Navbar />
            <div className='px-8 py-6 flex gap-x-4 bg-white'>
                <SettingLeftBar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-1">
                    {renderActiveComponent()}
                </div>
            </div>
        </>
    )
}

export default ProfileCustomizationPage