import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon
}: PremiumButtonProps) {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return Colors.gradientPrimary;
      case 'secondary':
        return Colors.gradientSecondary;
      case 'danger':
        return Colors.gradientDanger;
      case 'success':
        return Colors.gradientSuccess;
      default:
        return Colors.gradientPrimary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 12,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 16,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 20,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 16,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? [Colors.border, Colors.surface] as readonly [string, string] : getGradientColors()}
        style={[
          styles.gradient,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            borderRadius: sizeStyles.borderRadius,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyles.fontSize,
              color: disabled ? Colors.textMuted : 'white',
            },
            textStyle
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});