export type RegionCode = 'in' | 'us' | 'uk' | 'ae' | 'au' | 'ca' | 'sg';

export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'AED' | 'AUD' | 'CAD' | 'SGD';

export interface Region {
  code: RegionCode;
  name: string;
  currency: CurrencyCode;
  locale: string;
  enabled: boolean;
}

export const REGIONS: Record<RegionCode, Region> = {
  in: { code: 'in', name: 'India', currency: 'INR', locale: 'en-IN', enabled: true },
  us: { code: 'us', name: 'United States', currency: 'USD', locale: 'en-US', enabled: false },
  uk: { code: 'uk', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB', enabled: false },
  ae: { code: 'ae', name: 'United Arab Emirates', currency: 'AED', locale: 'en-AE', enabled: false },
  au: { code: 'au', name: 'Australia', currency: 'AUD', locale: 'en-AU', enabled: false },
  ca: { code: 'ca', name: 'Canada', currency: 'CAD', locale: 'en-CA', enabled: false },
  sg: { code: 'sg', name: 'Singapore', currency: 'SGD', locale: 'en-SG', enabled: false },
};

export const DEFAULT_REGION: RegionCode = 'in';
