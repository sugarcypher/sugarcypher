import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trophy, Medal, Award, Crown } from 'lucide-react-native';
import { LeaderboardEntry } from '@/types/gamification';
import colors from '@/constants/colors';
import BadgeDisplay from './BadgeDisplay';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showBadges?: boolean;
}

export default function Leaderboard({ entries, title = 'Leaderboard', showBadges = true }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" fill="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return <Trophy size={20} color={colors.subtext} />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { backgroundColor: '#FFD700' + '20', borderColor: '#FFD700' };
      case 2:
        return { backgroundColor: '#C0C0C0' + '20', borderColor: '#C0C0C0' };
      case 3:
        return { backgroundColor: '#CD7F32' + '20', borderColor: '#CD7F32' };
      default:
        return { backgroundColor: colors.card, borderColor: colors.border };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {entries.map((entry, index) => {
          const rankStyle = getRankStyle(entry.rank);
          
          return (
            <TouchableOpacity
              key={entry.userId}
              style={[styles.entryContainer, rankStyle]}
              activeOpacity={0.7}
            >
              <View style={styles.rankContainer}>
                {getRankIcon(entry.rank)}
                <Text style={[styles.rankText, { 
                  color: entry.rank <= 3 ? colors.text : colors.subtext 
                }]}>
                  #{entry.rank}
                </Text>
              </View>
              
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {entry.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{entry.username}</Text>
                  <Text style={styles.points}>{entry.points.toLocaleString()} XP</Text>
                </View>
              </View>
              
              {showBadges && entry.badge && (
                <View style={styles.badgeContainer}>
                  <BadgeDisplay badge={entry.badge} size="small" showName={false} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Trophy size={48} color={colors.subtext} />
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>Start earning points to appear on the leaderboard!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  points: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '500',
  },
  badgeContainer: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});