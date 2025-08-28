export default {
  light: {
    text: '#FFFFFF',
    background: '#0A0A0B',
    tint: '#6366F1',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#6366F1',
  },
  // Premium color palette
  primary: '#6366F1', // Premium indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#06B6D4', // Cyan
  secondaryLight: '#22D3EE',
  accent: '#10B981', // Emerald
  accentLight: '#34D399',
  
  // Backgrounds with depth
  background: '#0A0A0B', // Deep black
  backgroundSecondary: '#111113',
  card: '#1A1A1D', // Rich dark card
  cardElevated: '#212125',
  surface: '#2A2A2F',
  
  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: '#E5E7EB',
  subtext: '#9CA3AF',
  textMuted: '#6B7280',
  
  // Borders and dividers
  border: '#374151',
  borderLight: '#4B5563',
  divider: '#1F2937',
  
  // Status colors
  danger: '#EF4444',
  dangerLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  success: '#10B981',
  successLight: '#34D399',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  
  // Sugar-specific colors
  sugar: '#EC4899', // Hot pink for sugar
  sugarLight: '#F472B6',
  sugarDark: '#DB2777',
  
  // Gradients
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientSecondary: ['#06B6D4', '#3B82F6'] as const,
  gradientDanger: ['#EF4444', '#F97316'] as const,
  gradientSuccess: ['#10B981', '#059669'] as const,
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.25)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Legacy support
  error: '#EF4444',
};