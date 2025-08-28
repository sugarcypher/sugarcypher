import { Badge } from '@/types/gamification';

export const POINTS_CONFIG = {
  FOOD_LOG: 10,
  RECEIPT_SCAN: 25,
  POST_SHARE: 15,
  CHALLENGE_COMPLETE: 50,
  STREAK_BONUS: 5,
  BADGE_UNLOCK: 100,
  DAILY_LOGIN: 5,
  FIRST_TIME_BONUS: 20,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000, 35000, 50000, 75000
];

export const BADGES: Badge[] = [
  // Beginner Badges
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Log your first food item',
    icon: '👶',
    rarity: 'common',
    points: 50,
  },
  {
    id: 'scanner_novice',
    name: 'Scanner Novice',
    description: 'Scan your first receipt',
    icon: '📱',
    rarity: 'common',
    points: 50,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share your first post',
    icon: '🦋',
    rarity: 'common',
    points: 50,
  },

  // Activity Badges
  {
    id: 'consistent_logger',
    name: 'Consistent Logger',
    description: 'Log food for 7 days straight',
    icon: '📝',
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'sugar_detective',
    name: 'Sugar Detective',
    description: 'Scan 10 receipts',
    icon: '🕵️',
    rarity: 'rare',
    points: 150,
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Share 25 posts',
    icon: '🏆',
    rarity: 'epic',
    points: 200,
  },

  // Streak Badges
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    rarity: 'epic',
    points: 300,
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    rarity: 'legendary',
    points: 500,
  },

  // Achievement Badges
  {
    id: 'sugar_slayer',
    name: 'Sugar Slayer',
    description: 'Stay under sugar limit for 30 days',
    icon: '⚔️',
    rarity: 'epic',
    points: 250,
  },
  {
    id: 'health_guru',
    name: 'Health Guru',
    description: 'Reach level 10',
    icon: '🧘',
    rarity: 'legendary',
    points: 400,
  },
  {
    id: 'cypher_master',
    name: 'Cypher Master',
    description: 'Unlock all basic badges',
    icon: '🔐',
    rarity: 'legendary',
    points: 500,
  },
];

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
} as const;

export const COMPETITION_TYPES = {
  WEEKLY_LOGGER: {
    name: 'Weekly Logger Challenge',
    description: 'Log the most foods this week',
    duration: 7,
    prize: 'Sugar Detective Badge',
  },
  MONTHLY_SCANNER: {
    name: 'Monthly Scanner Master',
    description: 'Scan the most receipts this month',
    duration: 30,
    prize: 'Scanner Legend Badge',
  },
  STREAK_CHALLENGE: {
    name: 'Streak Challenge',
    description: 'Maintain the longest streak',
    duration: 14,
    prize: 'Streak Champion Badge',
  },
} as const;