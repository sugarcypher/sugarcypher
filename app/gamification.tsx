import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Trophy, Award, Target, Users } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useGamification } from '@/store/gamificationStore';
import GamificationHeader from '@/components/GamificationHeader';
import BadgeDisplay from '@/components/BadgeDisplay';
import Leaderboard from '@/components/Leaderboard';
import CompetitionCard from '@/components/CompetitionCard';
import { BADGES } from '@/constants/gamification';

type TabType = 'overview' | 'badges' | 'leaderboard' | 'competitions';

export default function GamificationScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { userStats, achievements, getRecentAchievements, getLeaderboard } = useGamification();

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Trophy },
    { id: 'badges' as TabType, label: 'Badges', icon: Award },
    { id: 'leaderboard' as TabType, label: 'Rankings', icon: Target },
    { id: 'competitions' as TabType, label: 'Compete', icon: Users },
  ];

  const mockCompetitions = [
    {
      id: '1',
      name: 'Weekly Sugar Tracker',
      description: 'Log the most foods this week to win exclusive badges',
      type: 'weekly' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      prize: 'Sugar Detective Badge',
      participants: 127,
      isActive: true,
      leaderboard: [],
    },
    {
      id: '2',
      name: 'Monthly Scanner Challenge',
      description: 'Scan the most receipts to become the ultimate sugar detective',
      type: 'monthly' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      prize: 'Scanner Legend Badge + 500 XP',
      participants: 89,
      isActive: true,
      leaderboard: [],
    },
  ];

  const mockLeaderboard = [
    {
      userId: '1',
      username: 'SugarSlayer',
      points: 2450,
      rank: 1,
      badge: BADGES[0],
    },
    {
      userId: '2',
      username: 'HealthGuru',
      points: 2100,
      rank: 2,
      badge: BADGES[1],
    },
    {
      userId: '3',
      username: 'CypherMaster',
      points: 1890,
      rank: 3,
      badge: BADGES[2],
    },
    {
      userId: 'current',
      username: 'You',
      points: userStats.totalPoints,
      rank: 4,
    },
  ];

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.badges.length}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {getRecentAchievements(3).map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Trophy size={20} color={colors.accent} />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementPoints}>+{achievement.points} XP</Text>
            </View>
          </View>
        ))}
        
        {getRecentAchievements().length === 0 && (
          <Text style={styles.emptyText}>No achievements yet. Start logging foods to earn your first badge!</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          {userStats.badges.slice(0, 5).map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="medium" />
          ))}
          
          {userStats.badges.length === 0 && (
            <Text style={styles.emptyText}>No badges earned yet!</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );

  const renderBadges = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earned Badges ({userStats.badges.length})</Text>
        <View style={styles.badgeGrid}>
          {userStats.badges.map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="large" />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.filter(badge => !userStats.badges.find(b => b.id === badge.id)).map((badge) => (
            <View key={badge.id} style={styles.lockedBadge}>
              <BadgeDisplay badge={badge} size="large" />
              <View style={styles.lockOverlay}>
                <Text style={styles.lockText}>🔒</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <Leaderboard entries={mockLeaderboard} title="Global Rankings" />
  );

  const renderCompetitions = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Active Competitions</Text>
      {mockCompetitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          userRank={Math.floor(Math.random() * 50) + 1}
        />
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'badges':
        return renderBadges();
      case 'leaderboard':
        return renderLeaderboard();
      case 'competitions':
        return renderCompetitions();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gamification',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <GamificationHeader />
      
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={20} color={isActive ? colors.accent : colors.subtext} />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.accent + '20',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.subtext,
    marginTop: 4,
  },
  activeTabLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  badgeScroll: {
    paddingVertical: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  lockedBadge: {
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});