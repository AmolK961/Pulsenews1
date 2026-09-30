import { AffiliateDeal, AffiliateConfig } from '../types/affiliate';

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  amazonTag: 'pulsenews-21',
  flipkartAffId: 'pulsenews_aff',
  cuelinksPubId: '',
  earnkaroCode: ''
};

export const AFFILIATE_DEALS: AffiliateDeal[] = [
  {
    id: 'deal-macbook-air-m2',
    title: 'Apple MacBook Air M2 Chip (13.6-inch Liquid Retina, 8GB RAM, 256GB SSD)',
    platform: 'amazon',
    category: 'laptops',
    originalPrice: 99900,
    discountedPrice: 69990,
    discountPercentage: 30,
    currency: '₹',
    rating: 4.8,
    reviewCount: 3840,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.amazon.in/dp/B0B3C9B27B',
    tagline: 'All-day battery life, Silent fanless design, M2 blazing silicon speed',
    badge: '🔥 Lightning Deal',
    isDealOfTheDay: true,
    endsInHours: 6
  },
  {
    id: 'deal-sony-wh1000xm5',
    title: 'Sony WH-1000XM5 Wireless Active Noise Canceling Headphones (30hr Battery)',
    platform: 'flipkart',
    category: 'audio',
    originalPrice: 34990,
    discountedPrice: 24990,
    discountPercentage: 29,
    currency: '₹',
    rating: 4.7,
    reviewCount: 2150,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itm5b9487c943cb9',
    tagline: 'Industry-leading ANC, 8 microphones, Crystal clear hands-free calls',
    badge: 'Flipkart SuperDeal',
    endsInHours: 12
  },
  {
    id: 'deal-samsung-s24-ultra',
    title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)',
    platform: 'amazon',
    category: 'smartphones',
    originalPrice: 134999,
    discountedPrice: 99999,
    discountPercentage: 26,
    currency: '₹',
    rating: 4.6,
    reviewCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.amazon.in/dp/B0CS5X6B1Z',
    tagline: 'Galaxy AI built-in, 200MP camera, Snapdragon 8 Gen 3',
    badge: 'Flat ₹35,000 Off'
  },
  {
    id: 'deal-dell-curved-monitor',
    title: 'Dell 34-inch WQHD Curved USB-C Hub Monitor (3440 x 1440, 60Hz, IPS)',
    platform: 'flipkart',
    category: 'workstation',
    originalPrice: 68500,
    discountedPrice: 42990,
    discountPercentage: 37,
    currency: '₹',
    rating: 4.8,
    reviewCount: 920,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.flipkart.com/dell-34-inch-curved-wqhd-monitor/p/itm284920491',
    tagline: 'Ultimate developer ultrawide setup with 90W single-cable USB-C charging',
    badge: '37% Discount'
  },
  {
    id: 'deal-apple-watch-s9',
    title: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum with Sport Band',
    platform: 'amazon',
    category: 'smartwatches',
    originalPrice: 44900,
    discountedPrice: 32990,
    discountPercentage: 27,
    currency: '₹',
    rating: 4.7,
    reviewCount: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.amazon.in/dp/B0CHX6P29J',
    tagline: 'S9 SiP chip, Double tap gesture, Bright 2000-nit always-on display',
    badge: 'Limited Stock'
  },
  {
    id: 'deal-logitech-mx-master-3s',
    title: 'Logitech MX Master 3S Wireless Performance Mouse (Quiet Clicks, 8K DPI)',
    platform: 'amazon',
    category: 'accessories',
    originalPrice: 10995,
    discountedPrice: 7490,
    discountPercentage: 32,
    currency: '₹',
    rating: 4.9,
    reviewCount: 6540,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.amazon.in/dp/B0B11D7T9M',
    tagline: 'Ergonomic shape, MagSpeed electromagnetic scroll, Works on any surface',
    badge: 'Top Seller'
  },
  {
    id: 'deal-nothing-phone-2a',
    title: 'Nothing Phone (2a) 5G (Black, 8GB RAM, 128GB Storage)',
    platform: 'flipkart',
    category: 'smartphones',
    originalPrice: 25999,
    discountedPrice: 19999,
    discountPercentage: 23,
    currency: '₹',
    rating: 4.5,
    reviewCount: 4320,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.flipkart.com/nothing-phone-2a-5g/p/itmd839201948',
    tagline: 'Custom Dimensity 7200 Pro, Glyph interface, 50MP dual cameras',
    badge: 'Steal Deal'
  },
  {
    id: 'deal-keychron-k2-keyboard',
    title: 'Keychron K2 Wireless Bluetooth Mechanical Keyboard (RGB Backlit, Gateron Red)',
    platform: 'amazon',
    category: 'workstation',
    originalPrice: 9499,
    discountedPrice: 6299,
    discountPercentage: 34,
    currency: '₹',
    rating: 4.7,
    reviewCount: 3120,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://www.amazon.in/dp/B07Y9Y69N7',
    tagline: 'Mac & Windows layout, 4000mAh battery, Hot-swappable mechanical switches',
    badge: '34% OFF'
  }
];

export function buildAffiliateUrl(baseDealUrl: string, platform: string, config?: AffiliateConfig): string {
  const cfg = config || getStoredAffiliateConfig();

  try {
    const url = new URL(baseDealUrl);
    if (platform === 'amazon') {
      const tag = cfg.amazonTag || 'pulsenews-21';
      url.searchParams.set('tag', tag);
      url.searchParams.set('linkCode', 'll1');
    } else if (platform === 'flipkart') {
      const affId = cfg.flipkartAffId || 'pulsenews_aff';
      url.searchParams.set('affid', affId);
    }
    return url.toString();
  } catch {
    return baseDealUrl;
  }
}

export function getStoredAffiliateConfig(): AffiliateConfig {
  if (typeof window === 'undefined') return DEFAULT_AFFILIATE_CONFIG;
  const stored = localStorage.getItem('pulsenews_affiliate_config');
  if (stored) {
    try {
      return { ...DEFAULT_AFFILIATE_CONFIG, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_AFFILIATE_CONFIG;
    }
  }
  return DEFAULT_AFFILIATE_CONFIG;
}

export function saveStoredAffiliateConfig(config: AffiliateConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pulsenews_affiliate_config', JSON.stringify(config));
}
