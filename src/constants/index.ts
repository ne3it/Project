export const APP_NAME = 'СтройКонтроль';
export const APP_TAGLINE = 'Отчет за 5 минут';

export const STORAGE_KEYS = {
  PROJECTS: 'projects',
  WORKERS: 'workers',
  MATERIALS: 'materials',
  REPORTS: 'reports',
  PHOTOS: 'photos',
  SETTINGS: 'settings',
  FORGE_TOKEN: 'forge_token',
} as const;

export const DEFAULT_TAX_SETTINGS = {
  regime: 'NPD' as const,
  npdRate: 4,
  ipRate: 5,
  vatRate: 20,
  isVatPayer: false,
};

export const COLORS = {
  background: '#0F0F0F', surface: '#1A1A1A', surfaceElevated: '#242424',
  textPrimary: '#FFFFFF', textSecondary: '#B3B3B3', textMuted: '#737373', textInverse: '#000000',
  primary: '#22C55E', primaryPressed: '#16A34A', primaryDisabled: '#4ADE80',
  secondary: '#3B82F6', secondaryPressed: '#2563EB',
  danger: '#EF4444', dangerPressed: '#DC2626',
  warning: '#F59E0B', warningPressed: '#D97706',
  border: '#333333', borderLight: '#404040',
  statusPlanning: '#3B82F6', statusActive: '#22C55E', statusPaused: '#F59E0B', statusCompleted: '#10B981', statusCancelled: '#EF4444',
  weatherSunny: '#FBBF24', weatherCloudy: '#9CA3AF', weatherRain: '#3B82F6', weatherSnow: '#E5E7EB', weatherWindy: '#6B7280',
} as const;

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const FONT_SIZES = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32, huge: 40 } as const;
export const BORDER_RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;
export const BUTTON_HEIGHT = 56;
export const BUTTON_HEIGHT_SM = 44;
export const INPUT_HEIGHT = 52;
export const ANIMATION_DURATION = 200;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
export const MAX_PHOTOS_PER_REPORT = 10;
export const CURRENCY = 'BYN';
export const CURRENCY_SYMBOL = 'BYN';
export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';