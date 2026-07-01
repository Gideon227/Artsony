'use client'
import { Button, Input } from '@/components'
import { PhoneInput } from '@/components/ui/phone-input'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Define strict validation schema
const accountBasicsSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Valid phone number is required"),
})

type AccountBasicsForm = z.infer<typeof accountBasicsSchema>

interface AccountBasicsProps {
    onNext: () => void;
}

const AccountBasics = ({ onNext }: AccountBasicsProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { isValid }
    } = useForm<AccountBasicsForm>({
        resolver: zodResolver(accountBasicsSchema),
        mode: 'onChange' // Triggers validation continuously to enable/disable button
    })

    const onSubmit = (data: AccountBasicsForm) => {
        // Safe to proceed, data perfectly matches schema
        console.log('Form validated successfully:', data)
        onNext()
    }

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)} 
            className='mx-auto border rounded-2xl border-gray-50 py-16 px-14 flex flex-col gap-y-14 items-center justify-center' 
            style={{ padding: 64, width: 917 }}
        >
            <div className='grid grid-cols-2 grid-rows-2 gap-4 items-center justify-center w-full'>
                <div className='flex flex-col' style={{ gap: 8 }}>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Full Name</label>
                    <Input 
                        {...register('fullName')} 
                        className='flex-1' 
                        placeholder='personal / business name'   
                    />
                </div>
                <div className='flex flex-col' style={{ gap: 8 }}>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Email</label>
                    <Input 
                        {...register('email')} 
                        className='flex-1' 
                        placeholder='forexample@gmail.com'  
                    />
                </div>
                <div className='flex flex-col' style={{ gap: 8 }}>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Username</label>
                    <Input 
                        {...register('username')} 
                        className='flex-1' 
                        placeholder='@Rocketman32' 
                    />
                </div>
                <div className='flex flex-col' style={{ gap: 8 }}>
                    <label className='font-poppins font-medium text-body-s text-heading tracking-wide'>Phone Number</label>
                    {/* Controller used for custom UI components to ensure perfect ref forwarding */}
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput {...field} />
                        )}
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                rightIcon='/icons/shield-user.svg' 
                size='lg' 
                className='mx-auto transition-opacity duration-300'
                disabled={!isValid}
            >
                Send Verification Code
            </Button>
        </form>
    )
}

export default AccountBasics