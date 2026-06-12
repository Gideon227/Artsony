import { Button } from '@/components'
import { useArtworkStore } from '@/store/artwork.store';
import Image from 'next/image'
import Router from 'next/router';
import { useRouter } from 'next/navigation';

interface Props {
    steps: string;
    number: string;
    onSaveAndExit: () => void
}

const UploadHeader = ({ steps, number, onSaveAndExit }: Props) => {
    const { clearDraft } = useArtworkStore()
    const router = useRouter()

    const cancel = () => {
        clearDraft()
        router.push('/profile')
    }

    return (
        <div className='flex justify-between px-6 py-4 items-center border-b border-gray-50'>
            <div className='flex gap-4 items-center'>
                <h6 className='font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide'>Step</h6>
                <h6 className='font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide'>
                    {number}<span className='text-gray-500'>/{steps}</span>
                </h6>
            </div>

            <div className='flex gap-4 items-center'>
                <Button
                    variant="outline"
                    className='py-3 px-6 leading-6 text-sm font-medium'
                    onClick={onSaveAndExit}
                >
                    Save Draft
                </Button>
                <button
                    type="button"
                    onClick={cancel}
                    className='border border-gray-50 rounded-full p-2 hover:bg-gray-50 transition-colors'
                >
                    <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
                </button>
            </div>
        </div>
    )
}

export default UploadHeader