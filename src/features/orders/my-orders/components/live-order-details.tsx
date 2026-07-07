import { ArtworkFormat, Variant } from '@/types';
import Image from 'next/image'
import React from 'react'

interface Props {
    orderId: string;
    trackingId: string;
    departureDate: string;
    departureTime: string;
    departurePlace: string;
    pickupAddress: string // Example: New Mexico ,  United States
    deliveryAddress: string;
    courier: {
        name: string;
        serviceType: string;
        estDeliveryDate: string;

    }
    lastUpdated: string;
    artwork: {
        name: string;
        media: string;
        artworkType: ArtworkFormat;
        variant: {
            type: string;
            value: string;
        }
        artworkCost: string;
        shippingCost: string;
        totalCost: string;
        qty: string;
        purchaseDate: string;
    }
}

const LiveOrderDetails = ({ orderId, trackingId, departurePlace, departureTime, departureDate, pickupAddress, deliveryAddress, courier, lastUpdated, artwork }: Props) => {
    
    const courierItems = [
        { id: 'courier-name', label: 'Courier', value: courier.name, refreshIcon: false },
        { id: 'service-type', label: 'Service Type', value: courier.serviceType, refreshIcon: false },
        { id: 'delivery-time', label: 'Est. Time of Delivery', value: courier.estDeliveryDate, refreshIcon: false },
        { id: 'last-updated', label: 'Last Updated', value: lastUpdated, refreshIcon: true }
    ]

    return (
        <div className='border-2 border-gray-50 rounded-xl min-w-[647px] flex flex-col bg-white'>
            <div className='p-4 border-b border-gray-50 flex flex-col gap-y-14 '>
                {/* First Section */}
                <div className='flex flex-col gap-y-6 w-full'>
                    <div className='flex justify-between items-center w-full '>
                        <h5 className='font-raleway font-semibold text-h5 text-body leading-8 tracking-wide'>Shipment Tracking</h5>
                        <button>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="path-1-inside-1_6548_36271" fill="white">
                                    <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                                </mask>
                                <path d="M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_6548_36271)"/>
                                <path d="M15 20C15 21.1046 14.1046 22 13 22C11.8954 22 11 21.1046 11 20C11 18.8954 11.8954 18 13 18C14.1046 18 15 18.8954 15 20Z" fill="#525965"/>
                                <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 18.8954 18 20 18C21.1046 18 22 18.8954 22 20Z" fill="#525965"/>
                                <path d="M29 20C29 21.1046 28.1046 22 27 22C25.8954 22 25 21.1046 25 20C25 18.8954 25.8954 18 27 18C28.1046 18 29 18.8954 29 20Z" fill="#525965"/>
                            </svg>
                        </button>
                    </div>

                    <div className='flex flex-col gap-y-10'>
                        {/* Timeline */}
                        <div className='flex justify-between items-center'>
                            <div className='flex gap-x-4 items-center'>
                                <span className='border border-gray-50 rounded-[20px] p-3'>
                                    <Image src='/icons/box.svg' width={38} height={38} alt='box icon' />
                                </span>
                                <div>
                                    <p className='py-1 gap-x-1 font-poppins text-gray-200 text-body-xs tracking-wide'>Order ID: <span className='text-info-500'>{orderId}</span></p>
                                    <p className='py-1 gap-x-1 font-poppins text-gray-200 text-body-xs tracking-wide'>Tracking ID: <span className='text-info-500'>{trackingId}</span></p>
                                </div>
                            </div>

                            <div className='flex flex-col gap-y-2'>
                                <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Timeline</p>
                                <div className='border border-gray-50 rounded-xl px-4 py-2 gap-x-2 flex items-center'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="11.999" cy="11.999" r="11.999" fill="#FEEFEC"/>
                                        <circle cx="11.9992" cy="12.0002" r="8.9025" fill="#FCDFD9"/>
                                        <circle cx="11.9993" cy="11.9981" r="6.58011" fill="#FABCAE"/>
                                        <g filter="url(#filter0_d_8916_9187)">
                                            <circle cx="11.9994" cy="12.0018" r="5.80645" fill="#F25B38"/>
                                        </g>
                                        <defs>
                                            <filter id="filter0_d_8916_9187" x="5.25189" y="5.72476" width="13.4951" height="13.4955" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                                <feOffset dy="0.47055"/>
                                                <feGaussianBlur stdDeviation="0.47055"/>
                                                <feComposite in2="hardAlpha" operator="out"/>
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8916_9187"/>
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8916_9187" result="shape"/>
                                            </filter>
                                        </defs>
                                    </svg>

                                    <p className='font-poppins text-body-xs text-body leading-4 tracking-wide'>
                                        Departed {departurePlace} Facility {' '} {departureDate} {' '} {departureTime}
                                    </p>

                                    <Image src='/icons/arrow-round-right-double.svg' width={20} height={20} alt='arrow icon' />
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className='flex items-center gap-x-6 w-full'>
                            <div className='flex flex-col flex-1 gap-y-1'>
                                <p className='font-poppins text-body-s text-gray-200 tracking-wide'>Pickup Address: </p>
                                <p className='font-poppins text-body-s text-body tracking-wide'>{pickupAddress}</p>
                            </div>

                            <Image src='/icons/line.svg' width={104} height={6} alt='line' />

                            <div className='flex flex-col flex-1 gap-y-1'>
                                <p className='font-poppins text-body-s text-gray-200 tracking-wide'>Delivery Address: </p>
                                <p className='font-poppins text-body-s text-body tracking-wide'>{deliveryAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-y-6 '>
                    <div className='w-full flex gap-x-2'>
                        {courierItems?.map((c, i) => (
                            <div className='flex flex-col gap-y-2' key={i}>
                                <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>{c.label}</p>
                                <div className='border border-gray-50 rounded-xl py-2 px-4 flex justify-between items-center text-center'>
                                    <p className='font-poppins text-body-xs text-body text-center'>{c.value}</p>
                                    {c.refreshIcon && (
                                        <button>
                                            <svg width="178" height="40" viewBox="0 0 178 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 0.5H157.667C168.436 0.500191 177.167 9.23057 177.167 20C177.167 30.7694 168.436 39.4998 157.667 39.5H20C9.23046 39.5 0.5 30.7695 0.5 20C0.5 9.23045 9.23045 0.5 20 0.5Z" fill="white"/>
                                                <path d="M20 0.5H157.667C168.436 0.500191 177.167 9.23057 177.167 20C177.167 30.7694 168.436 39.4998 157.667 39.5H20C9.23046 39.5 0.5 30.7695 0.5 20C0.5 9.23045 9.23045 0.5 20 0.5Z" stroke="#E6E8EB"/>
                                                <path d="M46.3963 23.124C47.4123 22.308 48.2083 21.64 48.7843 21.12C49.3603 20.592 49.8443 20.044 50.2363 19.476C50.6363 18.9 50.8363 18.336 50.8363 17.784C50.8363 17.264 50.7083 16.856 50.4523 16.56C50.2043 16.256 49.8003 16.104 49.2403 16.104C48.6963 16.104 48.2723 16.276 47.9683 16.62C47.6723 16.956 47.5123 17.408 47.4883 17.976H46.4323C46.4643 17.08 46.7363 16.388 47.2483 15.9C47.7603 15.412 48.4203 15.168 49.2283 15.168C50.0523 15.168 50.7043 15.396 51.1843 15.852C51.6723 16.308 51.9163 16.936 51.9163 17.736C51.9163 18.4 51.7163 19.048 51.3163 19.68C50.9243 20.304 50.4763 20.856 49.9723 21.336C49.4683 21.808 48.8243 22.36 48.0403 22.992H52.1683V23.904H46.3963V23.124ZM57.1147 17.304C57.6107 17.304 58.0587 17.412 58.4587 17.628C58.8587 17.836 59.1707 18.152 59.3947 18.576C59.6267 19 59.7427 19.516 59.7427 20.124V24H58.6627V20.28C58.6627 19.624 58.4987 19.124 58.1707 18.78C57.8427 18.428 57.3947 18.252 56.8267 18.252C56.2507 18.252 55.7907 18.432 55.4467 18.792C55.1107 19.152 54.9427 19.676 54.9427 20.364V24H53.8507V15.12H54.9427V18.36C55.1587 18.024 55.4547 17.764 55.8307 17.58C56.2147 17.396 56.6427 17.304 57.1147 17.304ZM62.8585 18.492C63.0505 18.116 63.3225 17.824 63.6745 17.616C64.0345 17.408 64.4705 17.304 64.9825 17.304V18.432H64.6945C63.4705 18.432 62.8585 19.096 62.8585 20.424V24H61.7665V17.424H62.8585V18.492ZM68.811 24.108C68.307 24.108 67.855 24.024 67.455 23.856C67.055 23.68 66.739 23.44 66.507 23.136C66.275 22.824 66.147 22.468 66.123 22.068H67.251C67.283 22.396 67.435 22.664 67.707 22.872C67.987 23.08 68.351 23.184 68.799 23.184C69.215 23.184 69.543 23.092 69.783 22.908C70.023 22.724 70.143 22.492 70.143 22.212C70.143 21.924 70.015 21.712 69.759 21.576C69.503 21.432 69.107 21.292 68.571 21.156C68.083 21.028 67.683 20.9 67.371 20.772C67.067 20.636 66.803 20.44 66.579 20.184C66.363 19.92 66.255 19.576 66.255 19.152C66.255 18.816 66.355 18.508 66.555 18.228C66.755 17.948 67.039 17.728 67.407 17.568C67.775 17.4 68.195 17.316 68.667 17.316C69.395 17.316 69.983 17.5 70.431 17.868C70.879 18.236 71.119 18.74 71.151 19.38H70.059C70.035 19.036 69.895 18.76 69.639 18.552C69.391 18.344 69.055 18.24 68.631 18.24C68.239 18.24 67.927 18.324 67.695 18.492C67.463 18.66 67.347 18.88 67.347 19.152C67.347 19.368 67.415 19.548 67.551 19.692C67.695 19.828 67.871 19.94 68.079 20.028C68.295 20.108 68.591 20.2 68.967 20.304C69.439 20.432 69.823 20.56 70.119 20.688C70.415 20.808 70.667 20.992 70.875 21.24C71.091 21.488 71.203 21.812 71.211 22.212C71.211 22.572 71.111 22.896 70.911 23.184C70.711 23.472 70.427 23.7 70.059 23.868C69.699 24.028 69.283 24.108 68.811 24.108ZM76.0238 20.688C76.0238 20.016 76.1598 19.428 76.4318 18.924C76.7038 18.412 77.0758 18.016 77.5478 17.736C78.0278 17.456 78.5598 17.316 79.1438 17.316C79.7198 17.316 80.2198 17.44 80.6438 17.688C81.0678 17.936 81.3838 18.248 81.5918 18.624V17.424H82.6958V24H81.5918V22.776C81.3758 23.16 81.0518 23.48 80.6198 23.736C80.1958 23.984 79.6998 24.108 79.1318 24.108C78.5478 24.108 78.0198 23.964 77.5478 23.676C77.0758 23.388 76.7038 22.984 76.4318 22.464C76.1598 21.944 76.0238 21.352 76.0238 20.688ZM81.5918 20.7C81.5918 20.204 81.4918 19.772 81.2918 19.404C81.0918 19.036 80.8198 18.756 80.4758 18.564C80.1398 18.364 79.7678 18.264 79.3598 18.264C78.9518 18.264 78.5798 18.36 78.2438 18.552C77.9078 18.744 77.6398 19.024 77.4398 19.392C77.2398 19.76 77.1398 20.192 77.1398 20.688C77.1398 21.192 77.2398 21.632 77.4398 22.008C77.6398 22.376 77.9078 22.66 78.2438 22.86C78.5798 23.052 78.9518 23.148 79.3598 23.148C79.7678 23.148 80.1398 23.052 80.4758 22.86C80.8198 22.66 81.0918 22.376 81.2918 22.008C81.4918 21.632 81.5918 21.196 81.5918 20.7ZM87.4932 17.316C88.0612 17.316 88.5572 17.44 88.9812 17.688C89.4132 17.936 89.7332 18.248 89.9412 18.624V17.424H91.0452V24.144C91.0452 24.744 90.9172 25.276 90.6612 25.74C90.4052 26.212 90.0372 26.58 89.5572 26.844C89.0852 27.108 88.5332 27.24 87.9012 27.24C87.0372 27.24 86.3172 27.036 85.7412 26.628C85.1652 26.22 84.8252 25.664 84.7212 24.96H85.8012C85.9212 25.36 86.1692 25.68 86.5452 25.92C86.9212 26.168 87.3732 26.292 87.9012 26.292C88.5012 26.292 88.9892 26.104 89.3652 25.728C89.7492 25.352 89.9412 24.824 89.9412 24.144V22.764C89.7252 23.148 89.4052 23.468 88.9812 23.724C88.5572 23.98 88.0612 24.108 87.4932 24.108C86.9092 24.108 86.3772 23.964 85.8972 23.676C85.4252 23.388 85.0532 22.984 84.7812 22.464C84.5092 21.944 84.3732 21.352 84.3732 20.688C84.3732 20.016 84.5092 19.428 84.7812 18.924C85.0532 18.412 85.4252 18.016 85.8972 17.736C86.3772 17.456 86.9092 17.316 87.4932 17.316ZM89.9412 20.7C89.9412 20.204 89.8412 19.772 89.6412 19.404C89.4412 19.036 89.1692 18.756 88.8252 18.564C88.4892 18.364 88.1172 18.264 87.7092 18.264C87.3012 18.264 86.9292 18.36 86.5932 18.552C86.2572 18.744 85.9892 19.024 85.7892 19.392C85.5892 19.76 85.4892 20.192 85.4892 20.688C85.4892 21.192 85.5892 21.632 85.7892 22.008C85.9892 22.376 86.2572 22.66 86.5932 22.86C86.9292 23.052 87.3012 23.148 87.7092 23.148C88.1172 23.148 88.4892 23.052 88.8252 22.86C89.1692 22.66 89.4412 22.376 89.6412 22.008C89.8412 21.632 89.9412 21.196 89.9412 20.7ZM95.9985 24.108C95.3825 24.108 94.8225 23.968 94.3185 23.688C93.8225 23.408 93.4305 23.012 93.1425 22.5C92.8625 21.98 92.7225 21.38 92.7225 20.7C92.7225 20.028 92.8665 19.436 93.1545 18.924C93.4505 18.404 93.8505 18.008 94.3545 17.736C94.8585 17.456 95.4225 17.316 96.0465 17.316C96.6705 17.316 97.2345 17.456 97.7385 17.736C98.2425 18.008 98.6385 18.4 98.9265 18.912C99.2225 19.424 99.3705 20.02 99.3705 20.7C99.3705 21.38 99.2185 21.98 98.9145 22.5C98.6185 23.012 98.2145 23.408 97.7025 23.688C97.1905 23.968 96.6225 24.108 95.9985 24.108ZM95.9985 23.148C96.3905 23.148 96.7585 23.056 97.1025 22.872C97.4465 22.688 97.7225 22.412 97.9305 22.044C98.1465 21.676 98.2545 21.228 98.2545 20.7C98.2545 20.172 98.1505 19.724 97.9425 19.356C97.7345 18.988 97.4625 18.716 97.1265 18.54C96.7905 18.356 96.4265 18.264 96.0345 18.264C95.6345 18.264 95.2665 18.356 94.9305 18.54C94.6025 18.716 94.3385 18.988 94.1385 19.356C93.9385 19.724 93.8385 20.172 93.8385 20.7C93.8385 21.236 93.9345 21.688 94.1265 22.056C94.3265 22.424 94.5905 22.7 94.9185 22.884C95.2465 23.06 95.6065 23.148 95.9985 23.148Z" fill="#525965"/>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M159.667 20C159.667 25.5228 155.189 30 149.667 30C144.144 30 139.667 25.5228 139.667 20C139.667 14.4772 144.144 10 149.667 10C155.189 10 159.667 14.4772 159.667 20ZM143.127 19.0833C143.5 15.7999 146.291 13.25 149.676 13.25C151.815 13.25 153.716 14.2679 154.919 15.8425C155.17 16.1716 155.107 16.6423 154.778 16.8938C154.449 17.1453 153.978 17.0823 153.727 16.7532C152.796 15.5344 151.328 14.75 149.676 14.75C147.119 14.75 145.003 16.6322 144.64 19.0833H145.003C145.307 19.0833 145.58 19.2662 145.696 19.5466C145.812 19.8269 145.748 20.1496 145.533 20.364L144.365 21.5307C144.072 21.8231 143.598 21.8231 143.305 21.5307L142.137 20.364C141.922 20.1496 141.858 19.8269 141.974 19.5466C142.09 19.2662 142.363 19.0833 142.667 19.0833H143.127ZM156.028 18.4693C155.736 18.1769 155.261 18.1769 154.968 18.4693L153.8 19.636C153.585 19.8504 153.521 20.1731 153.637 20.4534C153.753 20.7338 154.027 20.9167 154.33 20.9167H154.693C154.33 23.3678 152.215 25.25 149.657 25.25C148.013 25.25 146.551 24.4729 145.62 23.2638C145.367 22.9358 144.896 22.8748 144.568 23.1277C144.24 23.3806 144.179 23.8515 144.431 24.1796C145.635 25.7416 147.529 26.75 149.657 26.75C153.043 26.75 155.833 24.2001 156.206 20.9167H156.667C156.97 20.9167 157.244 20.7338 157.36 20.4534C157.476 20.1731 157.411 19.8504 157.197 19.636L156.028 18.4693Z" fill="#525965"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Timeline */}
                    
                    {/* Package Details */}
                    <div className='border-t border-gray-50 p-4 gap-y-6 flex flex-col '>
                        <h5 className='font-raleway font-semibold text-h5 text-body tracking-wide leading-8'>Package Details</h5>
                        
                        <div className='w-full flex gap-x-6 w-full'>
                            <Image src={artwork.media as string} width={114} height={114} className='rounded-xl bg-[#00000033]' alt='artwork image' />

                            <div className='grid grid-cols-3 gap-x-4 gap-y-2'>
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Artwork Name</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.name}</p>
                                </div>
                                
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Artwork Cost</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.artworkCost}</p>
                                </div>

                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Quantity</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.qty}</p>
                                </div>
                                
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Artwork Type</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.artworkType}</p>
                                </div>
                                
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Shipping Cost</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.shippingCost}</p>
                                </div>
                                
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Purchase Date</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.purchaseDate}</p>
                                </div>
                                
                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Variant</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.variant.type}: {artwork.variant.value}</p>
                                </div>

                                <div className='flex flex-col gap-y-1'>
                                    <p className='font-poppins text-body-xxs text-gray-200 tracking-wide'>Total</p>
                                    <p className='font-poppins text-body-xs text-body tracking-wide'>{artwork.totalCost}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
        </div>
    )
}

export default LiveOrderDetails