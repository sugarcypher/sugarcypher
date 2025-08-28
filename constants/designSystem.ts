// Enterprise Design System for SugarCypher
export const DesignSystem = {
  // Typography Scale
  typography: {
    display: {
      fontSize: 48,
      fontWeight: '900' as const,
      lineHeight: 56,
      letterSpacing: -1,
    },
    h1: {
      fontSize: 36,
      fontWeight: '800' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 10,
      fontWeight: '700' as const,
      lineHeight: 16,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
  },

  // Spacing Scale (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border Radius Scale
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Shadow System
  shadows: {
    sm: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Animation Durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
  },

  // Component Variants
  components: {
    card: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: '#1A1A1D',
    },
    button: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 24,
    },
    input: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
    },
  },
} as const;

// Premium Color Palette with semantic meanings
export const PremiumColors = {
  // Brand Colors
  brand: {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#06B6D4',
    secondaryLight: '#22D3EE',
    accent: '#10B981',
    accentLight: '#34D399',
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',
  },

  // Sugar-specific Colors
  sugar: {
    primary: '#EC4899',
    light: '#F472B6',
    dark: '#DB2777',
    gradient: ['#EC4899', '#F472B6'] as const,
  },

  // Background System
  background: {
    primary: '#0A0A0B',
    secondary: '#111113',
    tertiary: '#1A1A1D',
    elevated: '#212125',
    surface: '#2A2A2F',
  },

  // Text System
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    quaternary: '#6B7280',
    inverse: '#0F172A',
  },

  // Border System
  border: {
    primary: '#374151',
    secondary: '#4B5563',
    tertiary: '#1F2937',
  },
} as const;