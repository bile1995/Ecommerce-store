// Modern E-commerce Color Palette - Unified UX Design
export const colors = {
  // Primary Brand - Deep Indigo (Professional, trustworthy)
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff', 
    200: '#c7d6ff',
    300: '#a5b8ff',
    400: '#8b94ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81'
  },
  
  // Secondary - Emerald Green (Success, growth)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  
  // Accent - Amber (Highlights, CTAs)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#201710ff',
    800: '#92400e',
    900: '#78350f'
  },
  
  // Danger - Rose Red (Alerts, errors)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Neutral - Slate grays (Text, backgrounds, borders)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// CSS Custom Properties for consistent usage
export const cssVariables = {
  '--color-primary': colors.primary[500],
  '--color-primary-hover': colors.primary[600],
  '--color-secondary': colors.secondary[500],
  '--color-accent': colors.accent[500],
  '--color-danger': colors.danger[500],
  '--color-text': colors.neutral[800],
  '--color-text-light': colors.neutral[600],
  '--color-bg': colors.neutral[50],
  '--color-bg-card': '#ffffff',
  '--color-border': colors.neutral[200]
};
