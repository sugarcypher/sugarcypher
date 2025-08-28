import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Plus, 
  Filter, 
  Heart, 
  MessageCircle, 
  Trophy,
  Target,
  Users,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCommunityStore } from '@/store/communityStore';
import { PostFilter } from '@/types/community';
import CreatePostModal from '@/components/CreatePostModal';



const PostTypeFilters: { key: PostFilter; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'success', label: 'Success', icon: Trophy },
  { key: 'tip', label: 'Tips', icon: Target },
  { key: 'challenge', label: 'Help', icon: MessageCircle },
  { key: 'milestone', label: 'Milestones', icon: Award }
];

export default function CommunityScreen() {
  const {
    currentUser,
    filteredPosts,
    postFilter,
    activeGoals,

    setPostFilter,
    likePost,
    refreshData
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderUserStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/goals')}
      >
        <Text style={styles.statNumber}>{currentUser?.currentStreak || 0}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/goals')}
      >
        <Text style={styles.statNumber}>{activeGoals.length}</Text>
        <Text style={styles.statLabel}>Active Goals</Text>
      </TouchableOpacity>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{Math.round(currentUser?.averageDailySugar || 0)}g</Text>
        <Text style={styles.statLabel}>Avg Sugar</Text>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {PostTypeFilters.map((filter) => {
        const IconComponent = filter.icon;
        const isActive = postFilter === filter.key;
        
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            onPress={() => setPostFilter(filter.key)}
          >
            <IconComponent 
              size={16} 
              color={isActive ? Colors.background : Colors.subtext} 
            />
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

  const renderPost = (post: any) => {
    const getPostTypeColor = (type: string) => {
      switch (type) {
        case 'success': return '#4CAF50';
        case 'tip': return '#2196F3';
        case 'challenge': return '#FF9800';
        case 'milestone': return '#9C27B0';
        default: return Colors.primary;
      }
    };

    const getPostTypeLabel = (type: string) => {
      switch (type) {
        case 'success': return 'Success Story';
        case 'tip': return 'Pro Tip';
        case 'challenge': return 'Need Help';
        case 'milestone': return 'Milestone';
        default: return 'Post';
      }
    };

    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            {post.avatar ? (
              <Image source={{ uri: post.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {post.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.displayName}>{post.displayName}</Text>
              <Text style={styles.username}>@{post.username}</Text>
            </View>
          </View>
          <View style={styles.postMeta}>
            <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(post.type) }]}>
              <Text style={styles.postTypeBadgeText}>{getPostTypeLabel(post.type)}</Text>
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postText}>{post.content}</Text>
          
          {post.sugarData && (
            <View style={styles.sugarDataCard}>
              <View style={styles.sugarDataRow}>
                <View style={styles.sugarDataItem}>
                  <Text style={styles.sugarDataLabel}>Before</Text>
                  <Text style={styles.sugarDataValue}>{post.sugarData.beforeAmount}g</Text>
                </View>
                <TrendingUp size={20} color={Colors.primary} />
                <View style={styles.sugarDataItem}>
                  <Text style={styles.sugarDataLabel}>After</Text>
                  <Text style={styles.sugarDataValue}>{post.sugarData.afterAmount}g</Text>
                </View>
              </View>
              <Text style={styles.sugarDataPeriod}>Over {post.sugarData.period}</Text>
            </View>
          )}

          {post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => likePost(post.id)}
          >
            <Heart 
              size={20} 
              color={post.isLiked ? '#FF6B6B' : Colors.subtext}
              fill={post.isLiked ? '#FF6B6B' : 'none'}
            />
            <Text style={[
              styles.actionText,
              post.isLiked && { color: '#FF6B6B' }
            ]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={Colors.subtext} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Community',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Filter size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderUserStats()}
        {renderFilterTabs()}
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/goals')}
          >
            <Target size={20} color={Colors.primary} />
            <Text style={styles.quickActionText}>Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/challenges')}
          >
            <Zap size={20} color={Colors.primary} />
            <Text style={styles.quickActionText}>Challenges</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.primary} />
            <Text style={styles.quickActionText}>Create Post</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.postsContainer}>
          {filteredPosts.map(renderPost)}
        </View>
      </ScrollView>
      
      <CreatePostModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  filterContainer: {
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    gap: 6,
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
  postsContainer: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  username: {
    fontSize: 14,
    color: Colors.subtext,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  postTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.subtext,
  },
  postContent: {
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  postText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  sugarDataCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sugarDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sugarDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  sugarDataLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  sugarDataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sugarDataPeriod: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
});