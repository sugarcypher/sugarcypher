import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Users, Trophy, Clock } from 'lucide-react-native';
import { Competition } from '@/types/gamification';
import colors from '@/constants/colors';

interface CompetitionCardProps {
  competition: Competition;
  onPress?: () => void;
  userRank?: number;
}

export default function CompetitionCard({ competition, onPress, userRank }: CompetitionCardProps) {
  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(competition.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTypeColor = () => {
    switch (competition.type) {
      case 'weekly':
        return colors.accent;
      case 'monthly':
        return colors.primary;
      case 'challenge':
        return colors.warning;
      default:
        return colors.subtext;
    }
  };

  const daysRemaining = getDaysRemaining();
  const typeColor = getTypeColor();
  const isActive = competition.isActive && daysRemaining > 0;

  return (
    <TouchableOpacity
      style={[styles.container, !isActive && styles.inactiveContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.typeIndicator, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{competition.type.toUpperCase()}</Text>
        </View>
        
        {isActive && (
          <View style={styles.statusBadge}>
            <Clock size={12} color={colors.success} />
            <Text style={styles.statusText}>ACTIVE</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.name}>{competition.name}</Text>
      <Text style={styles.description}>{competition.description}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Users size={16} color={colors.subtext} />
          <Text style={styles.statText}>{competition.participants} participants</Text>
        </View>
        
        <View style={styles.statItem}>
          <Calendar size={16} color={colors.subtext} />
          <Text style={styles.statText}>
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.prizeContainer}>
          <Trophy size={16} color={colors.warning} />
          <Text style={styles.prizeText}>{competition.prize}</Text>
        </View>
        
        {userRank && (
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>Your Rank: #{userRank}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: colors.subtext,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 6,
  },
  rankContainer: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
});