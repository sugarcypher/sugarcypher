import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';
import { DAILY_SUGAR_LIMIT_GRAMS, getSugarSeverity } from '@/constants/sugarLimits';

interface SugarProgressBarProps {
  currentSugar: number;
  limit?: number;
  showLabel?: boolean;
  height?: number;
}

export default function SugarProgressBar({ 
  currentSugar, 
  limit = DAILY_SUGAR_LIMIT_GRAMS,
  showLabel = true,
  height = 12
}: SugarProgressBarProps) {
  const progress = Math.min(currentSugar / limit, 1);
  const severity = getSugarSeverity(currentSugar);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Enhanced progress calculation with smooth transitions
  const getProgressColor = () => {
    if (progress > 0.9) return [PremiumColors.semantic.error, PremiumColors.semantic.errorLight] as const;
    if (progress > 0.7) return [PremiumColors.semantic.warning, PremiumColors.semantic.warningLight] as const;
    if (progress > 0.5) return [PremiumColors.brand.secondary, PremiumColors.brand.secondaryLight] as const;
    return [PremiumColors.semantic.success, PremiumColors.semantic.successLight] as const;
  };
  
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [progress]);
  
  const animatedScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{currentSugar}g</Text>
          <Text style={styles.limitLabel}>of {limit}g daily limit</Text>
          <Text style={[styles.severityLabel, { color: severity.color }]}>
            {severity.label}
          </Text>
        </View>
      )}
      
      <View 
        style={[styles.progressBackground, { height: height + 8 }]}
        onLayout={handleLayout}
      >
        {/* Background glow effect */}
        <View style={[styles.progressGlow, { height: height + 8 }]} />
        
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              height: height + 8,
              transform: [{ scaleX: animatedScale }]
            }
          ]} 
        >
          <LinearGradient
            colors={getProgressColor()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
          
          {/* Progress shine effect */}
          <View style={styles.progressShine} />
        </Animated.View>
        
        {/* Progress markers */}
        <View style={styles.progressMarkers}>
          {[0.25, 0.5, 0.75].map((marker, index) => (
            <View 
              key={index}
              style={[
                styles.progressMarker,
                { left: `${marker * 100}%` }
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  label: {
    ...DesignSystem.typography.h4,
    color: PremiumColors.text.primary,
  },
  limitLabel: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.tertiary,
  },
  severityLabel: {
    ...DesignSystem.typography.overline,
    letterSpacing: 1,
  },
  progressBackground: {
    width: '100%',
    backgroundColor: PremiumColors.background.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: PremiumColors.border.tertiary,
    ...DesignSystem.shadows.md,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: DesignSystem.borderRadius.lg,
  },
  progressFill: {
    width: '100%',
    borderRadius: DesignSystem.borderRadius.lg,
    transformOrigin: 'left',
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
  },
  progressMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  progressMarker: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: -1,
  },
});