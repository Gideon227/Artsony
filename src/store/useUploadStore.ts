import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ArtworkUploadState } from '../types/upload';

const createInitialDraft = (purpose: 'share' | 'sell', artworkType: 'digital' | 'physical'): ArtworkUploadState => ({
  purpose,
  artworkType,
  currentStep: 1,
  name: '',
  artistProfile: null,
  description: '',
  categories: [],
  keywords: [],
  
  // Step 2 Default Values
  license: 'all-rights-reserved',
  visibility: 'everyone',
  moodboardSave: true,
  allowComments: true,
  allowLikes: true,
  
  isCollaboration: false,
  coOwners: [],
  materialsTools: [],
  status: 'draft',
  paymentType: purpose === 'share' ? 'free' : 'paid',
  price: null,
  dimensions: null,
  availableQty: null,
  maxPurchaseQty: null,
  hasVariations: false,
  variations: [],
  shippingLocations: [],
  files: [],
});

interface MultiDraftStore {
  drafts: Record<string, ArtworkUploadState>;
  initDraft: (id: string, purpose: 'share' | 'sell', type: 'digital' | 'physical') => void;
  updateDraft: (id: string, fields: Partial<ArtworkUploadState>) => void;
  removeDraft: (id: string) => void;
}

export const useUploadStore = create<MultiDraftStore>()(
  persist(
    (set) => ({
        drafts: {},

        initDraft: (id, purpose, type) =>
            set((state) => ({
                drafts: {
                    ...state.drafts,
                    [id]: createInitialDraft(purpose, type),
                },
            })),

        updateDraft: (id, fields) =>
            set((state) => {
                const currentDraft = state.drafts[id];
                
                // Guard: If the draft doesn't exist, change nothing
                if (!currentDraft) return state;

                return {
                    drafts: {
                        ...state.drafts,
                        [id]: { 
                            ...currentDraft, 
                            ...fields 
                        },
                    },
                };
            }),

        // FIX: Changed to mutable copy + delete to prevent TS 'unused variable' errors
        removeDraft: (id) =>
            set((state) => {
                const updatedDrafts = { ...state.drafts };
                delete updatedDrafts[id];
                return { drafts: updatedDrafts };
            }),
    }),
    {
      name: 'artsony-multi-upload-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);