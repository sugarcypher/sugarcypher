import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';

interface EnterpriseHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
  onPress?: () => void;
}

export default function EnterpriseHeader({
  title,
  subtitle,
  icon,
  rightAction,
  variant = 'default',
  onPress,
}: EnterpriseHeaderProps) {
  const content = (
    <View style={styles.content}>
      <View style={styles.leftSection}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.container, DesignSystem.shadows.lg]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.9 : 1}
      >
        <LinearGradient
          colors={[PremiumColors.brand.primary, PremiumColors.brand.primaryLight, PremiumColors.brand.secondary]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.container, styles.minimalContainer]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.9 : 1}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.defaultContainer,
        DesignSystem.shadows.md,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.lg,
  },
  defaultContainer: {
    backgroundColor: PremiumColors.background.elevated,
    borderWidth: 1,
    borderColor: PremiumColors.border.tertiary,
  },
  minimalContainer: {
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    padding: DesignSystem.spacing.xl,
    borderRadius: DesignSystem.borderRadius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.xl,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...DesignSystem.typography.h2,
    color: PremiumColors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.tertiary,
  },
  rightSection: {
    marginLeft: DesignSystem.spacing.md,
  },
});