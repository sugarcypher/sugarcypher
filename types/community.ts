export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  joinedDate: string;
  totalDaysTracked: number;
  currentStreak: number;
  longestStreak: number;
  averageDailySugar: number;
  badges: Badge[];
  isPrivate: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedDate: string;
  category: 'streak' | 'goal' | 'community' | 'milestone';
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'daily_sugar_limit' | 'weekly_average' | 'streak' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isPublic: boolean;
  progress: number; // 0-1
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  value: number;
  description: string;
  isCompleted: boolean;
  completedDate?: string;
  reward?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  type: 'success' | 'challenge' | 'tip' | 'question' | 'milestone';
  title: string;
  content: string;
  imageUri?: string;
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  goalId?: string; // If related to a specific goal
  sugarData?: {
    beforeAmount: number;
    afterAmount: number;
    period: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in days
  startDate: string;
  endDate: string;
  participants: number;
  isJoined: boolean;
  reward: string;
  rules: string[];
  progress?: {
    completed: number;
    total: number;
  };
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  sugarIntake: number;
  goalProgress: Record<string, number>; // goalId -> progress value
  mood: number;
  energy: number;
  notes?: string;
  isShared: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  rank: number;
  streak: number;
  change: number; // position change from last week
}

export type PostFilter = 'all' | 'success' | 'challenge' | 'tip' | 'question' | 'milestone';
export type GoalType = 'daily_sugar_limit' | 'weekly_average' | 'streak' | 'custom';
export type ChallengeFilter = 'all' | 'active' | 'upcoming' | 'completed';