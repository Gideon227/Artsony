// 'use client'
// import React, { useState } from 'react'
// import { WalletSummary } from '@/types/wallet';
// import { useWalletSummary } from '@/hooks/queries/use-wallet';
// import { walletPeriodFromSearchParams } from '@/lib/wallet/url-filters';
// import { useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import { cn } from '@/lib/utils';
// import { formatUsd } from '@/lib/wallet/format';
// import { HelpCircle } from 'lucide-react';
// import { TrendIndicator } from './wallet-summary-cards';

// type MetricCardConfig = {
//   key: string
//   label: string
//   icon: string;
//   iconBg: string
//   valueClassName?: string
//   showHelp?: boolean
// }

// const WalletStatsContent = () => {
//     const [loading, setLoading] = useState(false);
//     const searchParams = useSearchParams()


//     const period = React.useMemo(() => walletPeriodFromSearchParams(searchParams), [searchParams])
    
//     const { data: summary, isLoading: isSummaryLoading } = useWalletSummary(period)

//     const CARDS: MetricCardConfig[] = [
//         { key: 'total_earnings', label: 'Total Earnings', icon: '/wallet/money-wad-yellow.svg', iconBg: 'bg-primary-100', valueClassName: 'text-primary-500' },
//         { key: 'total_sales', label: 'Total Sales', icon: '/icons/shopping-bag.svg', iconBg: 'bg-primary-100', showHelp: true },
//         { key: 'artwork_views', label: 'Artwork Views', icon: '/wallet/eye-red.svg', iconBg: 'bg-primary-100', showHelp: true },
//         { key: 'artwork_likes', label: 'Artwork Likes', icon: 'wallet/heart-red.svg', iconBg: 'bg-primary-50' },
//     ]

//     if (!loading || !summary){
//         return (
//             <div></div>
//         )
//     }

//     return (
//         <div className='bg-secondary-100 p-4 flex flex-col gap-y-4 rounded-2xl'>
//             <div className='flex items-center gap-x-2'>
//                 {CARDS.map((card) => {
//                     const metric = summary[card?.key]
//                     return (
//                         <div className='border border-gray-50 rounded-2xl p-4 flex flex-col gap-y-8'>
//                             <div className="flex items-center justify-between">
//                                 <span className="text-body-s font-poppins leading-6 text-body">{card.label}</span>
//                                 <span className={cn('flex h-10 w-10 p-2 shrink-0 items-center justify-center rounded-full', card.iconBg)}>
//                                     <Image src={card.icon} width={24} height={24} alt='icon' />
//                                 </span>
//                             </div>

//                             <p className={cn('font-raleway text-h4 leading-10 font-medium text-heading', card.valueClassName)}>
//                                 <span className="mr-1 font-normal text-body-m text-text-alt-grey">$</span>
//                                 {formatUsd(metric.amount)}
//                             </p>

//                             <div className="flex items-center w-full justify-between">
//                                 <TrendIndicator metric={metric} />
//                                 {card.showHelp && (
//                                     <button type="button" aria-label={`About ${card.label.toLowerCase()}`} className="text-info-500">
//                                         <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     )
//                 })}
//             </div>
//         </div>
//     )
// }

// export default WalletStatsContent