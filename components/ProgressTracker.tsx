import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { 
  TrendingUp, 
  Target, 
  Trophy,
  Share2,
  Calendar
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCommunityStore } from '@/store/communityStore';
import { useFoodLogStore } from '@/store/foodLogStore';

export default function ProgressTracker() {
  const {
    activeGoals,
    currentUser,
    updateGoalProgress,
    addProgressEntry,
    shareProgress
  } = useCommunityStore();

  const {
    todaysTotalSugar,
    todaysFoods,
    getSugarProgress
  } = useFoodLogStore();

  // Update goal progress when sugar intake changes
  useEffect(() => {
    if (activeGoals.length > 0) {
      activeGoals.forEach(goal => {
        let newValue = 0;
        
        switch (goal.type) {
          case 'daily_sugar_limit':
            newValue = todaysTotalSugar;
            break;
          case 'weekly_average':
            // Calculate weekly average (simplified)
            newValue = todaysTotalSugar;
            break;
          case 'streak':
            // Calculate streak based on daily limit adherence
            newValue = todaysTotalSugar <= 25 ? goal.currentValue + 1 : 0;
            break;
          default:
            newValue = goal.currentValue;
        }
        
        if (newValue !== goal.currentValue) {
          updateGoalProgress(goal.id, newValue);
        }
      });
    }
  }, [todaysTotalSugar, activeGoals, updateGoalProgress]);

  // Add daily progress entry
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (todaysFoods.length > 0) {
      const goalProgress: Record<string, number> = {};
      activeGoals.forEach(goal => {
        goalProgress[goal.id] = goal.progress;
      });

      addProgressEntry({
        date: today,
        sugarIntake: todaysTotalSugar,
        goalProgress,
        mood: 3, // Default neutral mood
        energy: 3, // Default neutral energy
        isShared: false
      });
    }
  }, [todaysTotalSugar, todaysFoods.length, activeGoals, addProgressEntry]);

  const handleShareProgress = () => {
    if (activeGoals.length === 0) {
      Alert.alert('No Goals', 'Create a goal first to share your progress');
      return;
    }

    const completedGoals = activeGoals.filter(g => g.progress >= 1);
    const avgProgress = activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length;

    let message = '';
    if (completedGoals.length > 0) {
      message = `🎉 Just completed ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''}!`;
    } else if (avgProgress >= 0.8) {
      message = `💪 Making great progress on my goals! ${Math.round(avgProgress * 100)}% average completion.`;
    } else if (avgProgress >= 0.5) {
      message = `📈 Steady progress on my sugar reduction journey! ${Math.round(avgProgress * 100)}% of the way there.`;
    } else {
      message = `🌱 Starting my journey to reduce sugar intake. Current progress: ${Math.round(avgProgress * 100)}%`;
    }

    Alert.alert(
      'Share Progress',
      `Share your progress with the community?\n\n"${message}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            // This would create a milestone post
            Alert.alert('Success', 'Progress shared with the community!');
          }
        }
      ]
    );
  };

  const renderGoalProgress = (goal: any) => {
    const progressPercentage = Math.round(goal.progress * 100);
    const isCompleted = goal.progress >= 1;
    
    return (
      <View key={goal.id} style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalProgress}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
          </View>
          <View style={styles.goalStatus}>
            {isCompleted ? (
              <Trophy size={20} color="#4CAF50" />
            ) : (
              <Text style={[styles.progressPercentage, { color: Colors.primary }]}>
                {progressPercentage}%
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: isCompleted ? '#4CAF50' : Colors.primary
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  if (activeGoals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={32} color={Colors.subtext} />
        <Text style={styles.emptyText}>No active goals</Text>
        <Text style={styles.emptySubtext}>Create goals to track your progress</Text>
      </View>
    );
  }

  const completedGoals = activeGoals.filter(g => g.progress >= 1);
  const avgProgress = activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Progress Tracker</Text>
          <Text style={styles.subtitle}>
            {completedGoals.length} of {activeGoals.length} goals completed
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareProgress}
        >
          <Share2 size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.overallProgress}>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <TrendingUp size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{Math.round(avgProgress * 100)}%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
          
          <View style={styles.statItem}>
            <Trophy size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{completedGoals.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{currentUser?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.goalsList}>
        {activeGoals.map(renderGoalProgress)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.subtext,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  overallProgress: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 12,
    color: Colors.subtext,
  },
  goalStatus: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
  },
});