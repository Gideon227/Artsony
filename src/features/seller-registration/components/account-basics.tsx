import { Button, Input } from '@/components'
import { PhoneInput } from '@/components/ui/phone-input'

const AccountBasics = () => {
    return (
        <div className='mx-auto border rounded-2xl border-gray-50 py-16 px-14 flex flex-col gap-y-14 items-center justify-center'>
            <div className='grid grid-cols-2 grid-rows-2 gap-4 items-center justify-center'>
                <div className='flex flex-col gap-y-3'>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Full Name</label>
                    <Input placeholder='personal / business name'  />
                </div>
                <div className='flex flex-col gap-y-3'>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Email</label>
                    <Input placeholder='forexample@gmail.com'  />
                </div>
                <div className='flex flex-col gap-y-3'>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Username</label>
                    <Input placeholder='@Rocketman32' />
                </div>
                <div className='flex flex-col gap-y-3'>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Phone Number</label>
                    <PhoneInput /> 
                </div>
            </div>

            <Button rightIcon='/icons/shield-user.svg' size='lg' className='mx-auto'>Send Verification Code</Button>
        </div>
    )
}

export default AccountBasics