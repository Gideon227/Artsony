import React from 'react'
import Image from 'next/image';

export interface Artwork {
  id: string;
  imageUrl: string;
  title: string;
}

export interface MoodboardItem {
  id: string;
  title: string;
  artworks: Artwork[];
}

export type MoodboardCardVariant = 'populated' | 'empty' | 'add-new';

interface MoodboardCardProps {
  variant: MoodboardCardVariant;
  data?: MoodboardItem;
  onClick?: () => void;
}

export const MoodboardCard = React.memo(({ variant, data, onClick }: MoodboardCardProps) => {
    // ---------------------------------------------------------------------------
    // STATE 1: POPULATED (Has Artworks)
    // ---------------------------------------------------------------------------
    if (variant === 'populated' && data) {
        return (
            <button
                onClick={onClick}
                aria-label={`Open moodboard: ${data.title}`}
                className="group relative flex h-64 w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
                {/* Normal State: Base Images */}
                <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
                    {data.artworks.slice(0, 4).map((artwork) => (
                        <div key={artwork.id} className="relative h-full w-full overflow-hidden rounded-md bg-gray-100">
                            {/* Replace with actual Next.js Image implementation */}
                            <div className="h-full w-full bg-gray-200 transition-transform duration-500 group-hover:scale-105" />
                        </div>
                    ))}
                </div>

                {/* Hover State Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="translate-y-4 text-lg font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                        {data.title}
                    </span>
                    <span className="translate-y-4 text-sm text-gray-200 transition-transform duration-300 group-hover:translate-y-0">
                        {data.artworks.length} Artworks
                    </span>
                </div>
            </button>
        );
    }

  // ---------------------------------------------------------------------------
  // STATE 2: EMPTY (Exists, but no artworks)
  // ---------------------------------------------------------------------------
  if (variant === 'empty' && data) {
    return (
        <button
            onClick={onClick}
            aria-label={`Open empty moodboard: ${data.title}`}
            className="group flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
        >
            <div className="text-gray-400 transition-colors duration-300 group-hover:text-gray-600">
                {/* Insert Empty State SVG Icon Here */}
                <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800">
                {data.title} (Empty)
            </span>
        </button>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE 3: NO CARD / ADD NEW
  // ---------------------------------------------------------------------------
  return (
    <button
      onClick={onClick}
      aria-label="Create new moodboard"
      className="group flex h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 group-hover:text-blue-600">
            {/* Insert Add New SVG Icon Here */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </div>
        <span className="mt-4 font-medium text-blue-600 transition-colors duration-300 group-hover:text-blue-700">
            Create Moodboard
        </span>
    </button>
  );
});

MoodboardCard.displayName = 'MoodboardCard';