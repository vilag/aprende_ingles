/**
 * Tokens de diseño de la app móvil. Mismos valores que la web
 * (apps/web/src/app/globals.css) para una experiencia consistente.
 */
export const Colors = {
  light: {
    background: '#FBFAF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F1EC',
    ink: '#16162A',
    inkMuted: '#5B5B72',
    border: '#E6E2DA',
    brand: '#3B3BD6',
    brandSoft: '#ECECFD',
    onBrand: '#FFFFFF',
    accent: '#F0643F',
    accentSoft: '#FDEBE4',
    success: '#12805C',
    successSoft: '#E3F5EE',
    warning: '#A15C00',
    warningSoft: '#FDF1DC',
    danger: '#B42318',
    dangerSoft: '#FDECEB',
  },
  dark: {
    background: '#0E0E1A',
    surface: '#161627',
    surfaceMuted: '#1D1D33',
    ink: '#F1F0F7',
    inkMuted: '#A9A8C0',
    border: '#2B2B45',
    brand: '#8C8CFF',
    brandSoft: '#23234A',
    onBrand: '#0E0E1A',
    accent: '#FF8A66',
    accentSoft: '#3A2119',
    success: '#4FD1A1',
    successSoft: '#12322A',
    warning: '#F5B453',
    warningSoft: '#3A2A12',
    danger: '#FF8A80',
    dangerSoft: '#3D1715',
  },
} as const;

export type ThemeColors = { readonly [K in keyof typeof Colors.light]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const MaxContentWidth = 640;
