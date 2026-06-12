// types/upload.ts

export type UploadPurpose = 'sell' | 'share' | null;
export type ArtworkType = 'digital' | 'physical' | null;
export type PublishStatus = 'draft' | 'published';
export type PaymentType = 'free' | 'paid';

// FIX: Updated to match your exact Step Two dropdown layout strings
export type VisibilityStatus = 'everyone' | 'only-me' | 'followers';
export type LicenseStatus = 'all-rights-reserved' | 'creative-commons' | 'public-domain';

export interface Dimensions {
  length: number;
  breadth: number;
  height: number;
  weight: number;
  unit: string;
}

export interface ArtworkVariation {
  name: string;
  options: { id: string; value: string }[];
}

export interface CloudinaryFile {
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw' | '3d'; 
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ArtworkShippingConfig {
  selectedRegions: string[];
}

export interface UploadedArtworkFile {
  id: string;
  name: string;
  size: string;      // e.g., "14.2 MB"
  extension: string; // e.g., "JPG", "MP4", "ZIP", "GLTF"
  type: "image" | "video" | "3d" | "archive" | "generic";
  progress?: number; // For upload visualization
}

export interface ArtworkUploadState {
  // 1. Initial Flow Selection
  purpose: UploadPurpose;
  artworkType: ArtworkType;
  currentStep: number; // Added tracking metric

  // 2. Basic Info (Step 1)
  name: string;
  artistProfile: UserProfile | null;
  description: string;
  categories: string[];
  keywords: string[];

  // 3. Settings, Permissions & Rights (Step 2)
  license: LicenseStatus;               // FIX: Added property
  visibility: VisibilityStatus;         // FIX: Tied to corrected string values
  moodboardSave: boolean;               // FIX: Added property
  allowComments: boolean;
  allowLikes: boolean;                  // FIX: Added property (was allowLikesAndStats)

  // 4. Collaboration
  isCollaboration: boolean;
  coOwners: UserProfile[];

  // 5. Details
  materialsTools: string[];
  status: PublishStatus;

  // 6. Pricing 
  paymentType: PaymentType;
  price: number | null;

  // 7. Physical Details
  dimensions: Dimensions | null;
  availableQty: number | null;
  maxPurchaseQty: number | null;
  hasVariations: boolean;
  variations: ArtworkVariation[];
  shippingLocations: string[]; 
  shippingConfig?: ArtworkShippingConfig;

  // 8. Files / Assets
  // files: CloudinaryFile[];
  files?: UploadedArtworkFile[];
}