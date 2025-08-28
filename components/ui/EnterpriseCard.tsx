import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';

interface EnterpriseCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: keyof typeof DesignSystem.spacing;
  shadow?: keyof typeof DesignSystem.shadows;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
}

export default function EnterpriseCard({
  children,
  variant = 'default',
  padding = 'lg',
  shadow = 'md',
  style,
  gradientColors = [PremiumColors.background.tertiary, PremiumColors.background.elevated] as const,
}: EnterpriseCardProps) {
  const paddingValue = DesignSystem.spacing[padding];
  const shadowStyle = DesignSystem.shadows[shadow];

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: DesignSystem.borderRadius.lg,
      padding: paddingValue,
      ...shadowStyle,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: PremiumColors.background.elevated,
          borderWidth: 1,
          borderColor: PremiumColors.border.tertiary,
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        };
      case 'gradient':
        return baseStyle;
      default:
        return {
          ...baseStyle,
          backgroundColor: PremiumColors.background.tertiary,
        };
    }
  };

  if (variant === 'gradient') {
    return (
      <View style={[getCardStyle(), style]}>
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: DesignSystem.borderRadius.lg,
  },
});