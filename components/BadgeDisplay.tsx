import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/types/gamification';
import colors from '@/constants/colors';
import { RARITY_COLORS } from '@/constants/gamification';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

export default function BadgeDisplay({ badge, size = 'medium', showName = true }: BadgeDisplayProps) {
  const sizeStyles = {
    small: { container: 40, icon: 20, text: 10 },
    medium: { container: 60, icon: 30, text: 12 },
    large: { container: 80, icon: 40, text: 14 },
  };

  const currentSize = sizeStyles[size];
  const rarityColor = RARITY_COLORS[badge.rarity];

  return (
    <View style={styles.container}>
      <View style={[
        styles.badgeContainer,
        {
          width: currentSize.container,
          height: currentSize.container,
          borderColor: rarityColor,
        }
      ]}>
        <Text style={[styles.icon, { fontSize: currentSize.icon }]}>
          {badge.icon}
        </Text>
        <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />
      </View>
      
      {showName && (
        <View style={styles.textContainer}>
          <Text style={[styles.name, { fontSize: currentSize.text }]} numberOfLines={2}>
            {badge.name}
          </Text>
          <Text style={[styles.rarity, { color: rarityColor, fontSize: currentSize.text - 2 }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 4,
  },
  badgeContainer: {
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    textAlign: 'center',
  },
  rarityIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.card,
  },
  textContainer: {
    marginTop: 4,
    alignItems: 'center',
    maxWidth: 80,
  },
  name: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  rarity: {
    fontWeight: '500',
    marginTop: 2,
  },
});