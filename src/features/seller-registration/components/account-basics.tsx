'use client'

import { useCallback } from 'react'
import { Button, Input } from '@/components'
import { PhoneInput } from '@/components/ui/phone-input'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountBasicsSchema, type AccountBasicsFormValues } from '../schemas'
import { DEFAULT_DIAL_CODE, type AccountBasicsValues } from '../types'

interface AccountBasicsProps {
    defaultValues?: Partial<AccountBasicsValues>
    isSubmitting: boolean
    serverError?: string
    onSubmit: (values: AccountBasicsValues) => void | Promise<void>
}

const AccountBasics = ({ defaultValues, isSubmitting, serverError, onSubmit }: AccountBasicsProps) => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isValid },
    } = useForm<AccountBasicsFormValues>({
        resolver: zodResolver(accountBasicsSchema),
        mode: 'onTouched',
        defaultValues: {
            fullName: defaultValues?.fullName ?? '',
            email: defaultValues?.email ?? '',
            username: defaultValues?.username ?? '',
            phone: defaultValues?.phone ?? '',
            dialCode: defaultValues?.dialCode ?? DEFAULT_DIAL_CODE,
        },
    })

    const handleDialCodeChange = useCallback(
        (dialCode: string) => setValue('dialCode', dialCode),
        [setValue],
    )

    return (
        <form
            onSubmit={handleSubmit((values) => onSubmit(values))}
            noValidate
            className='mx-auto w-full max-w-[917px] border rounded-2xl border-gray-50 p-6 sm:p-10 lg:p-16 flex flex-col gap-y-10 lg:gap-y-14 items-center justify-center'
        >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full'>
                <div className='flex flex-col gap-y-2'>
                    <label htmlFor='seller-full-name' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Full Name</label>
                    <Input
                        id='seller-full-name'
                        {...register('fullName')}
                        autoComplete='name'
                        className='flex-1'
                        placeholder='personal / business name'
                        error={errors.fullName?.message}
                    />
                </div>
                <div className='flex flex-col gap-y-2'>
                    <label htmlFor='seller-email' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Email</label>
                    <Input
                        id='seller-email'
                        type='email'
                        {...register('email')}
                        autoComplete='email'
                        className='flex-1'
                        placeholder='forexample@gmail.com'
                        error={errors.email?.message}
                    />
                </div>
                <div className='flex flex-col gap-y-2'>
                    <label htmlFor='seller-username' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Username</label>
                    <Input
                        id='seller-username'
                        {...register('username')}
                        autoComplete='username'
                        className='flex-1'
                        placeholder='@Rocketman32'
                        error={errors.username?.message}
                    />
                </div>
                <div className='flex flex-col gap-y-2'>
                    <label htmlFor='seller-phone' className='font-poppins font-medium text-body-s text-heading tracking-wide'>Phone Number</label>
                    <Controller
                        name='phone'
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                {...field}
                                id='seller-phone'
                                type='tel'
                                autoComplete='tel-national'
                                defaultDialCode={defaultValues?.dialCode}
                                onDialCodeChange={handleDialCodeChange}
                            />
                        )}
                    />
                    {errors.phone?.message && (
                        <p className='pl-4 text-xs font-semibold text-error-500'>{errors.phone.message}</p>
                    )}
                </div>
            </div>

            {serverError && (
                <p role='alert' className='w-full text-center font-poppins text-body-xs font-medium text-error-500'>
                    {serverError}
                </p>
            )}

            <Button
                type='submit'
                rightIcon='/icons/shield-user.svg'
                size='lg'
                className='mx-auto w-full sm:w-auto transition-opacity duration-300'
                isLoading={isSubmitting}
                loadingText='Sending code…'
                disabled={!isValid || isSubmitting}
            >
                Send Verification Code
            </Button>
        </form>
    )
}

export default AccountBasics