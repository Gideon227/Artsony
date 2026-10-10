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
    const [mobileActiveTab, setMobileActiveTab] = useState<string>("")

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

    const renderMobileActiveComponent = () => {
        switch (mobileActiveTab) {
            case "personal":
                return <ProfileCustomization goBack={() => setMobileActiveTab('')} />
            case "account":
                return <AccountDetails goBack={() => setMobileActiveTab('')} />
            case "privacy-safety":
                return <PrivacySafety goBack={() => setMobileActiveTab('')} />
            case "security":
                return <Security goBack={() => setMobileActiveTab('')} />
            case "notification":
                return <NotificationSettings goBack={() => setMobileActiveTab('')} />
            case "payment":
                return <BillingPayment goBack={() => setMobileActiveTab('')} />
            case "shipping-location":
                return <ShippingLocation goBack={() => setMobileActiveTab('')} />
            default:
                return <SettingLeftBar activeTab={mobileActiveTab} setActiveTab={setMobileActiveTab} />
        }
    }

    return (
        <div className='flex min-h-dvh flex-col bg-white lg:h-dvh'>
            <div className="max-lg:hidden">
                <Navbar />
            </div>

            <div className='flex min-h-0 flex-1 gap-x-4 lg:px-8 lg:py-6 scrollbar-hide'>
                <div className="max-lg:hidden">
                    <SettingLeftBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <div className="lg:hidden min-w-0 flex-1">
                    {renderMobileActiveComponent()}
                </div>

                <div className="max-lg:hidden min-w-0 flex-1 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                    {renderActiveComponent()}
                </div>
            </div>
        </div>
    )
}

export default ProfileCustomizationPage