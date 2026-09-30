export type AffiliatePlatform = 'amazon' | 'flipkart' | 'cuelinks' | 'earnkaro';

export type DealCategory = 
  | 'laptops'
  | 'smartphones'
  | 'audio'
  | 'smartwatches'
  | 'workstation'
  | 'accessories';

export interface AffiliateDeal {
  id: string;
  title: string;
  platform: AffiliatePlatform;
  category: DealCategory;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  affiliateUrl: string;
  tagline: string;
  badge?: string;
  isDealOfTheDay?: boolean;
  endsInHours?: number;
}

export interface AffiliateConfig {
  amazonTag: string; // e.g. "pulsenews21-21"
  flipkartAffId: string; // e.g. "pulsenews_aff"
  cuelinksPubId?: string;
  earnkaroCode?: string;
}
