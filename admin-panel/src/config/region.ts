export type Region = 'ge' | 'az' | 'am';

interface RegionConfig {
  flag: string;
  name: string;
  phonePrefix: string;
  phonePlaceholder: string;
  phoneRegex: RegExp;
  phoneError: string;
}

const REGION_CONFIG: Record<Region, RegionConfig> = {
  ge: {
    flag: '🇬🇪',
    name: 'Georgia',
    phonePrefix: '+995',
    phonePlaceholder: '+995 555 123 456',
    phoneRegex: /^9955[0-9]{8}$/,
    phoneError: 'Georgian mobile: +995 5XX XXX XXX (e.g. +995555123456)',
  },
  az: {
    flag: '🇦🇿',
    name: 'Azerbaijan',
    phonePrefix: '+994',
    phonePlaceholder: '+994 50 123 4567',
    phoneRegex: /^994[0-9]{9}$/,
    phoneError: 'Azerbaijani mobile: +994 XX XXX XXXX (e.g. +994501234567)',
  },
  am: {
    flag: '🇦🇲',
    name: 'Armenia',
    phonePrefix: '+374',
    phonePlaceholder: '+374 77 123 456',
    phoneRegex: /^374[0-9]{8}$/,
    phoneError: 'Armenian mobile: +374 XX XXX XXX (e.g. +37477123456)',
  },
};

const raw = import.meta.env.VITE_REGION as Region | undefined;
const key: Region = raw && raw in REGION_CONFIG ? raw : 'ge';

export const region: RegionConfig = REGION_CONFIG[key];
export const regionKey: Region = key;
