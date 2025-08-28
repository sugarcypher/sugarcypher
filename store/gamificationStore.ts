import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { UserStats, Badge, Achievement, PointsTransaction, Competition } from '@/types/gamification';
import { POINTS_CONFIG, LEVEL_THRESHOLDS, BADGES } from '@/constants/gamification';

const STORAGE_KEYS = {
  USER_STATS: 'gamification_user_stats',
  ACHIEVEMENTS: 'gamification_achievements',
  TRANSACTIONS: 'gamification_transactions',
} as const;

const initialUserStats: UserStats = {
  totalPoints: 0,
  level: 1,
  streak: 0,
  foodsLogged: 0,
  receiptsScanned: 0,
  postsShared: 0,
  challengesCompleted: 0,
  badges: [],
  rank: 0,
  weeklyPoints: 0,
  monthlyPoints: 0,
};

export const [GamificationProvider, useGamification] = createContextHook(() => {
  const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [statsData, achievementsData, transactionsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_STATS),
        AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
      ]);

      if (statsData) {
        setUserStats(JSON.parse(statsData));
      }
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }
      if (transactionsData) {
        setTransactions(JSON.parse(transactionsData));
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserStats = async (stats: UserStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
      setUserStats(stats);
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(newAchievements));
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const saveTransactions = async (newTransactions: PointsTransaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const calculateLevel = (points: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getPointsToNextLevel = (currentPoints: number): number => {
    const currentLevel = calculateLevel(currentPoints);
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return 0;
    }
    return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
  };

  const checkBadgeUnlock = (stats: UserStats): Badge[] => {
    const newBadges: Badge[] = [];
    const unlockedBadgeIds = stats.badges.map(b => b.id);

    BADGES.forEach(badge => {
      if (unlockedBadgeIds.includes(badge.id)) return;

      let shouldUnlock = false;

      switch (badge.id) {
        case 'first_steps':
          shouldUnlock = stats.foodsLogged >= 1;
          break;
        case 'scanner_novice':
          shouldUnlock = stats.receiptsScanned >= 1;
          break;
        case 'social_butterfly':
          shouldUnlock = stats.postsShared >= 1;
          break;
        case 'consistent_logger':
          shouldUnlock = stats.streak >= 7;
          break;
        case 'sugar_detective':
          shouldUnlock = stats.receiptsScanned >= 10;
          break;
        case 'community_champion':
          shouldUnlock = stats.postsShared >= 25;
          break;
        case 'week_warrior':
          shouldUnlock = stats.streak >= 7;
          break;
        case 'month_master':
          shouldUnlock = stats.streak >= 30;
          break;
        case 'streak_legend':
          shouldUnlock = stats.streak >= 100;
          break;
        case 'health_guru':
          shouldUnlock = stats.level >= 10;
          break;
        case 'cypher_master':
          const basicBadges = ['first_steps', 'scanner_novice', 'social_butterfly', 'consistent_logger'];
          shouldUnlock = basicBadges.every(id => unlockedBadgeIds.includes(id));
          break;
      }

      if (shouldUnlock) {
        newBadges.push({ ...badge, unlockedAt: new Date() });
      }
    });

    return newBadges;
  };

  const awardPoints = async (
    type: PointsTransaction['type'],
    customPoints?: number,
    description?: string
  ) => {
    const points = customPoints || POINTS_CONFIG[type.toUpperCase() as keyof typeof POINTS_CONFIG] || 0;
    const transaction: PointsTransaction = {
      id: Date.now().toString(),
      type,
      points,
      description: description || `Earned ${points} points for ${type.replace('_', ' ')}`,
      timestamp: new Date(),
    };

    const newTransactions = [transaction, ...transactions];
    const newTotalPoints = userStats.totalPoints + points;
    const newLevel = calculateLevel(newTotalPoints);
    const leveledUp = newLevel > userStats.level;

    let updatedStats = {
      ...userStats,
      totalPoints: newTotalPoints,
      level: newLevel,
    };

    switch (type) {
      case 'food_log':
        updatedStats.foodsLogged += 1;
        break;
      case 'receipt_scan':
        updatedStats.receiptsScanned += 1;
        break;
      case 'post_share':
        updatedStats.postsShared += 1;
        break;
      case 'challenge_complete':
        updatedStats.challengesCompleted += 1;
        break;
    }

    const newBadges = checkBadgeUnlock(updatedStats);
    if (newBadges.length > 0) {
      updatedStats.badges = [...updatedStats.badges, ...newBadges];
      
      const badgeAchievements: Achievement[] = newBadges.map(badge => ({
        id: `badge_${badge.id}_${Date.now()}`,
        type: 'points',
        title: `Badge Unlocked: ${badge.name}`,
        description: badge.description,
        points: badge.points,
        timestamp: new Date(),
      }));
      
      const newAchievements = [...badgeAchievements, ...achievements];
      await saveAchievements(newAchievements);
    }

    if (leveledUp) {
      const levelAchievement: Achievement = {
        id: `level_${newLevel}_${Date.now()}`,
        type: 'points',
        title: `Level Up! Level ${newLevel}`,
        description: `You've reached level ${newLevel}!`,
        points: 50,
        timestamp: new Date(),
      };
      
      const newAchievements = [levelAchievement, ...achievements];
      await saveAchievements(newAchievements);
    }

    await saveUserStats(updatedStats);
    await saveTransactions(newTransactions);

    return {
      pointsEarned: points,
      leveledUp,
      newLevel,
      badgesUnlocked: newBadges,
    };
  };

  const updateStreak = async (newStreak: number) => {
    const updatedStats = { ...userStats, streak: newStreak };
    await saveUserStats(updatedStats);
  };

  const getRecentAchievements = (limit: number = 5): Achievement[] => {
    return achievements.slice(0, limit);
  };

  const getLeaderboard = (): UserStats[] => {
    return [userStats];
  };

  return {
    userStats,
    achievements,
    transactions,
    competitions,
    isLoading,
    awardPoints,
    updateStreak,
    getPointsToNextLevel: () => getPointsToNextLevel(userStats.totalPoints),
    getRecentAchievements,
    getLeaderboard,
    checkBadgeUnlock: () => checkBadgeUnlock(userStats),
  };
});