import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Filter, 
  Users, 
  Calendar, 
  Trophy,
  Clock,
  CheckCircle,
  User,
  Target,
  Zap
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCommunityStore } from '@/store/communityStore';
import { ChallengeFilter, Challenge } from '@/types/community';

const ChallengeFilters: { key: ChallengeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' }
];

export default function ChallengesScreen() {
  const {
    filteredChallenges,
    challengeFilter,
    setChallengeFilter,
    joinChallenge,
    leaveChallenge
  } = useCommunityStore();

  const [selectedFilter, setSelectedFilter] = useState<ChallengeFilter>('all');

  const handleFilterChange = (filter: ChallengeFilter) => {
    setSelectedFilter(filter);
    setChallengeFilter(filter);
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    if (challenge.isJoined) {
      Alert.alert(
        'Leave Challenge',
        `Are you sure you want to leave "${challenge.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => leaveChallenge(challenge.id)
          }
        ]
      );
    } else {
      Alert.alert(
        'Join Challenge',
        `Join "${challenge.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: () => joinChallenge(challenge.id)
          }
        ]
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return Colors.primary;
    }
  };

  const getStatusInfo = (challenge: Challenge) => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);

    if (now < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        label: `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`,
        color: Colors.primary
      };
    } else if (now > endDate) {
      return {
        status: 'completed',
        label: 'Completed',
        color: '#4CAF50'
      };
    } else {
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: 'active',
        label: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
        color: '#FF9800'
      };
    }
  };

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {ChallengeFilters.map((filter) => {
        const isActive = selectedFilter === filter.key;
        
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterTabText,
              isActive && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderChallengeCard = (challenge: Challenge) => {
    const statusInfo = getStatusInfo(challenge);
    const difficultyColor = getDifficultyColor(challenge.difficulty);

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
          
          <View style={styles.challengeMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyText}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.challengeDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.subtext} />
              <Text style={styles.detailText}>{challenge.duration} days</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Users size={16} color={Colors.subtext} />
              <Text style={styles.detailText}>{challenge.participants} participants</Text>
            </View>
            
            <View style={styles.detailItem}>
              {challenge.type === 'individual' ? (
                <User size={16} color={Colors.subtext} />
              ) : (
                <Users size={16} color={Colors.subtext} />
              )}
              <Text style={styles.detailText}>
                {challenge.type === 'individual' ? 'Individual' : 'Group'}
              </Text>
            </View>
          </View>

          {challenge.progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressText}>
                  {challenge.progress.completed} / {challenge.progress.total}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      width: `${(challenge.progress.completed / challenge.progress.total) * 100}%`,
                      backgroundColor: Colors.primary
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          <View style={styles.rewardSection}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.rewardText}>Reward: {challenge.reward}</Text>
          </View>

          <View style={styles.rulesSection}>
            <Text style={styles.rulesTitle}>Rules:</Text>
            {challenge.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.challengeActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              challenge.isJoined ? styles.leaveButton : styles.joinButton,
              statusInfo.status === 'completed' && styles.disabledButton
            ]}
            onPress={() => handleJoinChallenge(challenge)}
            disabled={statusInfo.status === 'completed'}
          >
            {challenge.isJoined ? (
              <>
                <CheckCircle size={20} color={Colors.background} />
                <Text style={styles.actionButtonText}>
                  {statusInfo.status === 'completed' ? 'Completed' : 'Joined'}
                </Text>
              </>
            ) : (
              <>
                <Zap size={20} color={Colors.background} />
                <Text style={styles.actionButtonText}>
                  {statusInfo.status === 'upcoming' ? 'Join Challenge' : 'Join Now'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Challenges',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Filter size={20} color={Colors.text} />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderFilterTabs()}
        
        <View style={styles.challengesContainer}>
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(renderChallengeCard)
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No Challenges Found</Text>
              <Text style={styles.emptyDescription}>
                {selectedFilter === 'all' 
                  ? 'No challenges available at the moment'
                  : `No ${selectedFilter} challenges found`
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  challengesContainer: {
    padding: 16,
    gap: 16,
  },
  challengeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    marginBottom: 16,
  },
  challengeInfo: {
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.subtext,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
  challengeDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: Colors.subtext,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  progressText: {
    fontSize: 14,
    color: Colors.subtext,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  rulesSection: {
    marginBottom: 16,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  ruleBullet: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 14,
    color: Colors.subtext,
    flex: 1,
    lineHeight: 20,
  },
  challengeActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  joinButton: {
    backgroundColor: Colors.primary,
  },
  leaveButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: Colors.subtext,
    opacity: 0.6,
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});