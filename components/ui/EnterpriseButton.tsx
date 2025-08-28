import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';

interface EnterpriseButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function EnterpriseButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: EnterpriseButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: DesignSystem.spacing.md,
          borderRadius: DesignSystem.borderRadius.sm,
          fontSize: 14,
        };
      case 'lg':
        return {
          height: 56,
          paddingHorizontal: DesignSystem.spacing.xl,
          borderRadius: DesignSystem.borderRadius.lg,
          fontSize: 18,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: DesignSystem.spacing.lg,
          borderRadius: DesignSystem.borderRadius.md,
          fontSize: 16,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradientColors: [PremiumColors.brand.primary, PremiumColors.brand.primaryLight] as const,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          gradientColors: [PremiumColors.brand.secondary, PremiumColors.brand.secondaryLight] as const,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          gradientColors: [PremiumColors.semantic.error, PremiumColors.semantic.errorLight] as const,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'success':
        return {
          gradientColors: [PremiumColors.semantic.success, PremiumColors.semantic.successLight] as const,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          gradientColors: ['transparent', 'transparent'] as const,
          textColor: PremiumColors.brand.primary,
          borderColor: PremiumColors.brand.primary,
        };
      case 'ghost':
        return {
          gradientColors: ['transparent', 'transparent'] as const,
          textColor: PremiumColors.text.secondary,
          borderColor: 'transparent',
        };
      default:
        return {
          gradientColors: [PremiumColors.brand.primary, PremiumColors.brand.primaryLight] as const,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  const buttonContent = (
    <View style={styles.contentContainer}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            color: isDisabled ? PremiumColors.text.quaternary : variantStyles.textColor,
            fontWeight: DesignSystem.typography.body1.fontWeight,
          },
          textStyle,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: fullWidth ? '100%' : 'auto',
          opacity: isDisabled ? 0.6 : 1,
        },
        DesignSystem.shadows.md,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isDisabled
            ? [PremiumColors.neutral[700], PremiumColors.neutral[600]] as const
            : variantStyles.gradientColors
        }
        style={[
          styles.gradient,
          {
            height: sizeStyles.height,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderRadius: sizeStyles.borderRadius,
            borderWidth: variant === 'outline' ? 1 : 0,
            borderColor: variantStyles.borderColor,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {buttonContent}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: PremiumColors.neutral[900],
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
});