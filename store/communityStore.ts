import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, 
  Goal, 
  CommunityPost, 
  Comment, 
  Challenge, 
  ProgressEntry, 
  LeaderboardEntry,
  PostFilter,
  ChallengeFilter,
  Badge
} from '@/types/community';

interface CommunityState {
  // User data
  currentUser: User | null;
  
  // Goals
  goals: Goal[];
  activeGoals: Goal[];
  
  // Community posts
  posts: CommunityPost[];
  filteredPosts: CommunityPost[];
  postFilter: PostFilter;
  
  // Comments
  comments: Record<string, Comment[]>; // postId -> comments
  
  // Challenges
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  challengeFilter: ChallengeFilter;
  
  // Progress tracking
  progressEntries: ProgressEntry[];
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  
  // Loading states
  isLoading: boolean;
  isPostsLoading: boolean;
  isChallengesLoading: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  
  // Goal actions
  createGoal: (goal: Omit<Goal, 'id' | 'userId' | 'currentValue' | 'progress'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
  
  // Post actions
  createPost: (post: Omit<CommunityPost, 'id' | 'userId' | 'username' | 'displayName' | 'avatar' | 'likes' | 'comments' | 'isLiked' | 'createdAt' | 'updatedAt'>) => void;
  likePost: (postId: string) => void;
  setPostFilter: (filter: PostFilter) => void;
  
  // Comment actions
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  
  // Challenge actions
  joinChallenge: (challengeId: string) => void;
  leaveChallenge: (challengeId: string) => void;
  setChallengeFilter: (filter: ChallengeFilter) => void;
  
  // Progress actions
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'userId'>) => void;
  shareProgress: (entryId: string) => void;
  
  // Utility actions
  refreshData: () => Promise<void>;
  calculateUserStats: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const mockUser: User = {
  id: 'user1',
  username: 'sugarwarrior',
  displayName: 'Sugar Warrior',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e0e4d4?w=100&h=100&fit=crop&crop=face',
  joinedDate: '2024-01-15',
  totalDaysTracked: 45,
  currentStreak: 7,
  longestStreak: 14,
  averageDailySugar: 28.5,
  badges: [
    {
      id: 'badge1',
      name: 'First Week',
      description: 'Completed your first week of tracking',
      icon: '🏆',
      color: '#FFD700',
      earnedDate: '2024-01-22',
      category: 'streak'
    },
    {
      id: 'badge2',
      name: 'Goal Crusher',
      description: 'Achieved your first goal',
      icon: '🎯',
      color: '#FF6B6B',
      earnedDate: '2024-02-01',
      category: 'goal'
    }
  ],
  isPrivate: false
};

const mockPosts: CommunityPost[] = [
  {
    id: 'post1',
    userId: 'user2',
    username: 'healthyeater',
    displayName: 'Healthy Eater',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    type: 'success',
    title: 'Hit my 30-day streak! 🎉',
    content: 'I can\'t believe I\'ve been tracking my sugar intake for 30 days straight! My energy levels are through the roof and I\'ve lost 8 pounds. The key was meal prepping on Sundays.',
    tags: ['streak', 'milestone', 'energy'],
    likes: 24,
    comments: 8,
    isLiked: false,
    createdAt: '2024-02-28T10:30:00Z',
    updatedAt: '2024-02-28T10:30:00Z',
    sugarData: {
      beforeAmount: 65,
      afterAmount: 25,
      period: '30 days'
    }
  },
  {
    id: 'post2',
    userId: 'user3',
    username: 'sweetfreedom',
    displayName: 'Sweet Freedom',
    type: 'tip',
    title: 'Hidden sugar hack: Read ingredients backwards',
    content: 'Pro tip: Ingredients are listed by quantity. If sugar (or its aliases) appears in the first 3 ingredients, put it back! I\'ve been doing this for 2 weeks and it\'s a game changer.',
    tags: ['tips', 'hidden-sugars', 'shopping'],
    likes: 18,
    comments: 12,
    isLiked: true,
    createdAt: '2024-02-27T15:45:00Z',
    updatedAt: '2024-02-27T15:45:00Z'
  },
  {
    id: 'post3',
    userId: 'user4',
    username: 'momof3',
    displayName: 'Mom of 3',
    type: 'challenge',
    title: 'Struggling with afternoon cravings',
    content: 'Every day around 3 PM I get intense sugar cravings. I\'ve tried fruit, nuts, water... nothing seems to help. Any suggestions? I don\'t want to break my 12-day streak!',
    tags: ['cravings', 'help', 'afternoon'],
    likes: 6,
    comments: 15,
    isLiked: false,
    createdAt: '2024-02-27T09:20:00Z',
    updatedAt: '2024-02-27T09:20:00Z'
  }
];

const mockChallenges: Challenge[] = [
  {
    id: 'challenge1',
    title: '7-Day Sugar Detox',
    description: 'Eliminate all added sugars for 7 consecutive days',
    type: 'individual',
    difficulty: 'hard',
    duration: 7,
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    participants: 156,
    isJoined: true,
    reward: 'Detox Master Badge',
    rules: [
      'No added sugars in any form',
      'Natural fruit sugars are allowed',
      'Read all ingredient labels',
      'Log all meals daily'
    ],
    progress: {
      completed: 3,
      total: 7
    }
  },
  {
    id: 'challenge2',
    title: 'Mindful March',
    description: 'Practice mindful eating and track your mood daily',
    type: 'group',
    difficulty: 'medium',
    duration: 31,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    participants: 89,
    isJoined: false,
    reward: 'Mindfulness Badge',
    rules: [
      'Log mood and energy levels daily',
      'Practice 5-minute mindful eating',
      'Share weekly reflections',
      'Support group members'
    ]
  }
];

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: mockUser,
      goals: [],
      activeGoals: [],
      posts: mockPosts,
      filteredPosts: mockPosts,
      postFilter: 'all',
      comments: {},
      challenges: mockChallenges,
      filteredChallenges: mockChallenges,
      challengeFilter: 'all',
      progressEntries: [],
      leaderboard: [],
      isLoading: false,
      isPostsLoading: false,
      isChallengesLoading: false,
      
      // User actions
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },
      
      // Goal actions
      createGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: generateId(),
          userId: get().currentUser?.id || '',
          currentValue: 0,
          progress: 0
        };
        
        const updatedGoals = [...get().goals, newGoal];
        const activeGoals = updatedGoals.filter(g => g.isActive);
        
        set({ 
          goals: updatedGoals,
          activeGoals
        });
      },
      
      updateGoal: (goalId: string, updates: Partial<Goal>) => {
        const updatedGoals = get().goals.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        );
        const activeGoals = updatedGoals.filter(g => g.isActive);
        
        set({ 
          goals: updatedGoals,
          activeGoals
        });
      },
      
      deleteGoal: (goalId: string) => {
        const updatedGoals = get().goals.filter(goal => goal.id !== goalId);
        const activeGoals = updatedGoals.filter(g => g.isActive);
        
        set({ 
          goals: updatedGoals,
          activeGoals
        });
      },
      
      updateGoalProgress: (goalId: string, value: number) => {
        const updatedGoals = get().goals.map(goal => {
          if (goal.id === goalId) {
            const progress = Math.min(value / goal.targetValue, 1);
            return { 
              ...goal, 
              currentValue: value,
              progress
            };
          }
          return goal;
        });
        
        const activeGoals = updatedGoals.filter(g => g.isActive);
        
        set({ 
          goals: updatedGoals,
          activeGoals
        });
      },
      
      // Post actions
      createPost: (postData) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const newPost: CommunityPost = {
          ...postData,
          id: generateId(),
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          likes: 0,
          comments: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedPosts = [newPost, ...get().posts];
        const filteredPosts = get().postFilter === 'all' 
          ? updatedPosts 
          : updatedPosts.filter(post => post.type === get().postFilter);
        
        set({ 
          posts: updatedPosts,
          filteredPosts
        });
      },
      
      likePost: (postId: string) => {
        const updatedPosts = get().posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked
            };
          }
          return post;
        });
        
        const filteredPosts = get().postFilter === 'all' 
          ? updatedPosts 
          : updatedPosts.filter(post => post.type === get().postFilter);
        
        set({ 
          posts: updatedPosts,
          filteredPosts
        });
      },
      
      setPostFilter: (filter: PostFilter) => {
        const filteredPosts = filter === 'all' 
          ? get().posts 
          : get().posts.filter(post => post.type === filter);
        
        set({ 
          postFilter: filter,
          filteredPosts
        });
      },
      
      // Comment actions
      addComment: (postId: string, content: string) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const newComment: Comment = {
          id: generateId(),
          postId,
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          content,
          likes: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          replies: []
        };
        
        const updatedComments = {
          ...get().comments,
          [postId]: [...(get().comments[postId] || []), newComment]
        };
        
        // Update post comment count
        const updatedPosts = get().posts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        );
        
        const filteredPosts = get().postFilter === 'all' 
          ? updatedPosts 
          : updatedPosts.filter(post => post.type === get().postFilter);
        
        set({ 
          comments: updatedComments,
          posts: updatedPosts,
          filteredPosts
        });
      },
      
      likeComment: (postId: string, commentId: string) => {
        const updatedComments = {
          ...get().comments,
          [postId]: get().comments[postId]?.map(comment => 
            comment.id === commentId
              ? {
                  ...comment,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                  isLiked: !comment.isLiked
                }
              : comment
          ) || []
        };
        
        set({ comments: updatedComments });
      },
      
      // Challenge actions
      joinChallenge: (challengeId: string) => {
        const updatedChallenges = get().challenges.map(challenge => 
          challenge.id === challengeId
            ? { 
                ...challenge, 
                isJoined: true,
                participants: challenge.participants + 1
              }
            : challenge
        );
        
        const filteredChallenges = get().challengeFilter === 'all'
          ? updatedChallenges
          : updatedChallenges.filter(challenge => {
              const now = new Date();
              const startDate = new Date(challenge.startDate);
              const endDate = new Date(challenge.endDate);
              
              switch (get().challengeFilter) {
                case 'active':
                  return now >= startDate && now <= endDate;
                case 'upcoming':
                  return now < startDate;
                case 'completed':
                  return now > endDate;
                default:
                  return true;
              }
            });
        
        set({ 
          challenges: updatedChallenges,
          filteredChallenges
        });
      },
      
      leaveChallenge: (challengeId: string) => {
        const updatedChallenges = get().challenges.map(challenge => 
          challenge.id === challengeId
            ? { 
                ...challenge, 
                isJoined: false,
                participants: Math.max(0, challenge.participants - 1)
              }
            : challenge
        );
        
        const filteredChallenges = get().challengeFilter === 'all'
          ? updatedChallenges
          : updatedChallenges.filter(challenge => {
              const now = new Date();
              const startDate = new Date(challenge.startDate);
              const endDate = new Date(challenge.endDate);
              
              switch (get().challengeFilter) {
                case 'active':
                  return now >= startDate && now <= endDate;
                case 'upcoming':
                  return now < startDate;
                case 'completed':
                  return now > endDate;
                default:
                  return true;
              }
            });
        
        set({ 
          challenges: updatedChallenges,
          filteredChallenges
        });
      },
      
      setChallengeFilter: (filter: ChallengeFilter) => {
        const filteredChallenges = filter === 'all'
          ? get().challenges
          : get().challenges.filter(challenge => {
              const now = new Date();
              const startDate = new Date(challenge.startDate);
              const endDate = new Date(challenge.endDate);
              
              switch (filter) {
                case 'active':
                  return now >= startDate && now <= endDate;
                case 'upcoming':
                  return now < startDate;
                case 'completed':
                  return now > endDate;
                default:
                  return true;
              }
            });
        
        set({ 
          challengeFilter: filter,
          filteredChallenges
        });
      },
      
      // Progress actions
      addProgressEntry: (entryData) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const newEntry: ProgressEntry = {
          ...entryData,
          id: generateId(),
          userId: currentUser.id
        };
        
        const updatedEntries = [...get().progressEntries, newEntry];
        
        set({ progressEntries: updatedEntries });
      },
      
      shareProgress: (entryId: string) => {
        const updatedEntries = get().progressEntries.map(entry => 
          entry.id === entryId
            ? { ...entry, isShared: true }
            : entry
        );
        
        set({ progressEntries: updatedEntries });
      },
      
      // Utility actions
      refreshData: async () => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ isLoading: false });
      },
      
      calculateUserStats: () => {
        const currentUser = get().currentUser;
        const progressEntries = get().progressEntries;
        
        if (!currentUser || progressEntries.length === 0) return;
        
        // Calculate average daily sugar
        const totalSugar = progressEntries.reduce((sum, entry) => sum + entry.sugarIntake, 0);
        const averageDailySugar = totalSugar / progressEntries.length;
        
        // Calculate current streak
        let currentStreak = 0;
        const sortedEntries = progressEntries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        for (const entry of sortedEntries) {
          if (entry.sugarIntake <= 25) { // Assuming 25g is the target
            currentStreak++;
          } else {
            break;
          }
        }
        
        const updatedUser: User = {
          ...currentUser,
          averageDailySugar,
          currentStreak,
          totalDaysTracked: progressEntries.length
        };
        
        set({ currentUser: updatedUser });
      }
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);