import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Zap, Crown } from 'lucide-react-native';
import { useGamification } from '@/store/gamificationStore';
import colors from '@/constants/colors';
import { LEVEL_THRESHOLDS } from '@/constants/gamification';

interface GamificationHeaderProps {
  onPress?: () => void;
}

export default function GamificationHeader({ onPress }: GamificationHeaderProps) {
  const { userStats, getPointsToNextLevel } = useGamification();
  const pointsToNext = getPointsToNextLevel();
  const currentLevelPoints = userStats.level > 1 ? LEVEL_THRESHOLDS[userStats.level - 1] : 0;
  const nextLevelPoints = userStats.level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[userStats.level] : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = userStats.level < LEVEL_THRESHOLDS.length ? 
    (userStats.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) : 1;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[colors.cardElevated, colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.leftSection}>
          <LinearGradient
            colors={[colors.warning, colors.warningLight]}
            style={styles.levelBadge}
          >
            <Crown size={18} color="white" />
            <Text style={styles.levelText}>{userStats.level}</Text>
          </LinearGradient>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[colors.accent, colors.accentLight]}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {userStats.totalPoints} XP {pointsToNext > 0 && `• ${pointsToNext} to next level`}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statItem}>
            <LinearGradient
              colors={[colors.warning + '20', colors.warning + '10']}
              style={styles.statBadge}
            >
              <Zap size={14} color={colors.warning} />
              <Text style={styles.statText}>{userStats.streak}</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statItem}>
            <LinearGradient
              colors={[colors.accent + '20', colors.accent + '10']}
              style={styles.statBadge}
            >
              <Trophy size={14} color={colors.accent} />
              <Text style={styles.statText}>{userStats.badges.length}</Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 16,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    marginLeft: 4,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
});