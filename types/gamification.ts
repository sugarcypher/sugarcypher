export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  streak: number;
  foodsLogged: number;
  receiptsScanned: number;
  postsShared: number;
  challengesCompleted: number;
  badges: Badge[];
  rank: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'challenge';
  startDate: Date;
  endDate: Date;
  prize: string;
  participants: number;
  isActive: boolean;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  rank: number;
  badge?: Badge;
}

export interface Achievement {
  id: string;
  type: 'points' | 'streak' | 'activity' | 'social';
  title: string;
  description: string;
  points: number;
  timestamp: Date;
}

export interface PointsTransaction {
  id: string;
  type: 'food_log' | 'receipt_scan' | 'post_share' | 'challenge_complete' | 'streak_bonus' | 'badge_unlock';
  points: number;
  description: string;
  timestamp: Date;
}