'use client'

import { Button, Input } from '@/components'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import ConfirmDeactivation from '../ui/confirm-deactivation'
import ConfirmDeletion from '../ui/confirm-deletion'
import { useChangePassword } from '@/hooks/use-auth-mutations'
import { useAuthStore } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'

type PasswordForm = { current: string; next: string; confirm: string }
type PasswordErrors = Partial<Record<keyof PasswordForm, string>>

const EMPTY_FORM: PasswordForm = { current: '', next: '', confirm: '' }

// Mirrors the server's rules (password.service.ts) so the user sees what is
// wrong before submitting. The server still re-checks all of it.
function validate(form: PasswordForm): PasswordErrors {
    const errors: PasswordErrors = {}
    const pw = form.next

    if (!form.current) errors.current = 'Enter your current password'

    if (!pw) errors.next = 'Enter a new password'
    else if (pw.length < 8) errors.next = 'Use at least 8 characters'
    else if (pw.length > 128) errors.next = 'Password is too long (128 characters max)'
    else if (!/[A-Z]/.test(pw)) errors.next = 'Add at least one uppercase letter'
    else if (!/[a-z]/.test(pw)) errors.next = 'Add at least one lowercase letter'
    else if (!/[0-9]/.test(pw)) errors.next = 'Add at least one number'
    else if (!/[^A-Za-z0-9]/.test(pw)) errors.next = 'Add at least one special character'
    else if (pw === form.current) errors.next = 'New password must be different from your current one'

    if (!form.confirm) errors.confirm = 'Confirm your new password'
    else if (form.confirm !== pw) errors.confirm = 'Passwords do not match'

    return errors
}

const Security = ({ goBack }: { goBack?: () => void }) => {
    const { user } = useAuthStore()
    const { mutate: changePassword, isPending } = useChangePassword()
    const { error: toastError } = useToast()

    const [form, setForm] = useState<PasswordForm>(EMPTY_FORM)
    const [errors, setErrors] = useState<PasswordErrors>({})

    // State to manage modal visibility
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Accounts created through Google/Facebook have no password to change.
    const hasPassword = user?.provider === 'local'

    const setField = (key: keyof PasswordForm) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setForm((f) => ({ ...f, [key]: value }))
        setErrors((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleSave = () => {
        if (!hasPassword || isPending) return

        const found = validate(form)
        setErrors(found)
        if (Object.keys(found).length > 0) return

        changePassword(
            { currentPassword: form.current, newPassword: form.next },
            {
                // Success signs the user out (the server revokes every session) — see useChangePassword.
                onError: (err) => {
                    if (err instanceof HttpError && err.fields && !Array.isArray(err.fields)) {
                        const fields = err.fields
                        const fromServer: PasswordErrors = {}
                        if (fields['currentPassword']) fromServer.current = fields['currentPassword']
                        if (fields['password']) fromServer.next = fields['password']
                        if (fields['newPassword']) fromServer.next = fields['newPassword']
                        if (Object.keys(fromServer).length > 0) {
                            setErrors(fromServer)
                            return
                        }
                    }
                    toastError(
                        'Could not change password',
                        err instanceof HttpError ? err.message : 'Something went wrong. Please try again.',
                    )
                },
            },
        )
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        handleSave()
    }

    return (
        <div className='flex w-full flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-gray-50'>
            <div className='sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-50 bg-white px-4 max-lg:pb-4 max-lg:pt-6 lg:static lg:px-8 lg:py-4'>
                <div className='flex items-center gap-2'>
                    <button onClick={goBack} className='cursor-pointer lg:hidden'>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="path-1-inside-1_10796_3029" fill="white">
                            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                        </mask>
                        <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10796_3029)"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
                        </svg>
                    </button>
                    <h5 className='max-lg:font-poppins lg:font-raleway font-medium lg:font-semibold max-lg:text-body-s lg:text-h5 text-body lg:text-primary-500 leading-10 tracking-wide'>Security</h5>
                </div>
                <Button
                    size='sm'
                    className='rounded-2xl max-lg:w-20 max-lg:h-10 max-lg:text-body-xs'
                    onClick={handleSave}
                    isLoading={isPending}
                    loadingText='Saving…'
                    disabled={!hasPassword || isPending}
                >
                    Save
                </Button>
            </div>

            <div className='flex flex-col gap-y-16 px-4 pb-16 pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-8 lg:pb-8 scrollbar-hide'>
                <div className='flex flex-col gap-y-6'>
                    <p className='font-poppins font-semibold text-body-m text-primary-500 leading-8 tracking-wide'>Change Password</p>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className='bg-secondary-50 p-6 gap-y-4 flex flex-col border-secondary-50 rounded-xl'
                    >
                        {!hasPassword && (
                            <p className='font-poppins text-body-xs leading-5 tracking-wide text-text-disabled'>
                                You signed in with {user?.provider === 'facebook' ? 'Facebook' : 'Google'}, so this account has no
                                password to change.
                            </p>
                        )}
                        <Input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="current-password"
                            className="h-12"
                            value={form.current}
                            onChange={setField('current')}
                            error={errors.current}
                            disabled={!hasPassword || isPending}
                        />
                        <Input
                            type="password"
                            placeholder="Enter New Password"
                            autoComplete="new-password"
                            className="h-12"
                            value={form.next}
                            onChange={setField('next')}
                            error={errors.next}
                            disabled={!hasPassword || isPending}
                        />
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            autoComplete="new-password"
                            className="h-12"
                            value={form.confirm}
                            onChange={setField('confirm')}
                            error={errors.confirm}
                            disabled={!hasPassword || isPending}
                        />
                        <Link href='/forgot-password' className='flex mx-auto w-full'>
                            <p className='font-poppins font-medium text-body-s text-primary-500 leading-6 tracking-wide'>Forgot Password? Reset</p>
                        </Link>
                    </form>
                </div>

                <div className='bg-secondary-50 p-6 flex flex-col gap-y-8 rounded-xl mt-6'>
                    <div className='flex flex-col gap-y-4'>
                        <div className='flex gap-x-3 items-center'>
                            <p className='font-poppins font-medium text-heading text-body-s leading-6 tracking-wide'>Deactivate Account</p>
                            <Image src='/icons/question-circle.svg' width={20} height={20} alt='question mark' />
                        </div>
                        <p className='font-poppins text-text-disabled text-body-xs leading-5 tracking-wide'>
                            Deactivating your account will temporarily disable your Artsony profile and activity. <br /><br />
                            While deactivated, your profile won&apos;t be visible, you won&apos;t be able to buy or sell artworks, and notifications will be paused. Your account data, order history, and wallet balance will be kept safe until you return.<br />
                            You can reactivate your account anytime by logging back in.
                        </p>
                        <div className="pt-2">
                            <Button 
                                variant='outline' 
                                size='md' 
                                onClick={() => setIsDeactivateOpen(true)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>

                    <hr className="border-gray-200 max-lg:hidden" />

                    <div className='flex flex-col gap-y-4'>
                        <div className='flex gap-x-3 items-center'>
                            <p className='font-poppins font-medium text-heading text-body-s leading-6 tracking-wide'>Delete Account</p>
                            <Image src='/icons/question-circle.svg' width={20} height={20} alt='question mark' />
                        </div>
                        <p className='font-poppins text-text-disabled text-body-xs leading-5 tracking-wide'>
                            Deleting your account will permanently remove your Artsony profile and access to the platform. <br /><br />
                            Once deleted, you will no longer be able to sign in or recover your account, settings, or history. This action cannot be undone.<br />
                            If you are a seller before deleting your account, make sure all orders are completed or resolved. If your account has a remaining balance, you&apos;ll need to withdraw those funds first.
                            Please confirm that you want to continue.
                        </p>
                        <div className="pt-2">
                            <Button 
                                variant='primary' 
                                size='md' 
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Modals Conditionally */}
            {isDeactivateOpen && (
                <ConfirmDeactivation onClose={() => setIsDeactivateOpen(false)} />
            )}
            
            {isDeleteOpen && (
                <ConfirmDeletion onClose={() => setIsDeleteOpen(false)} />
            )}
        </div>
    )
}

export default Security