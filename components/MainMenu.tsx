import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useFoodLogStore } from '@/store/foodLogStore';
import SugarProgressBar from './SugarProgressBar';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Camera, 
  Barcode, 
  Plus, 
  BarChart2, 
  MessageCircle, 
  Settings, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  BookOpen,
  Heart
} from 'lucide-react-native';

interface MainMenuProps {
  visible: boolean;
  onClose: () => void;
  onReflectionPress: () => void;
}

export default function MainMenu({ visible, onClose, onReflectionPress }: MainMenuProps) {
  const router = useRouter();
  const { todaysTotalSugar, todaysFoods, insights } = useFoodLogStore();
  
  const slideAnim = React.useRef(new Animated.Value(visible ? 0 : -100)).current;
  const fadeAnim = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [visible]);
  
  const handleNavigation = (path: string) => {
    onClose();
    router.push(path as any);
  };
  
  const getRecentFoods = () => {
    return todaysFoods
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  };
  
  const getTodayStats = () => {
    const totalCalories = todaysFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
    const hiddenSugarCount = todaysFoods.reduce((count, food) => 
      count + (food.hiddenSugars?.length || 0), 0
    );
    
    return { totalCalories, hiddenSugarCount };
  };
  
  const stats = getTodayStats();
  const recentFoods = getRecentFoods();
  
  const renderFeatureCard = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    gradientColors: [string, string] = [Colors.primary, Colors.secondary],
    size: 'large' | 'medium' = 'medium'
  ) => (
    <TouchableOpacity 
      style={[styles.featureCard, size === 'large' && styles.featureCardLarge]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.featureGradient, size === 'large' && styles.featureGradientLarge]}
      >
        <View style={styles.featureIcon}>
          {icon}
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderStatCard = (title: string, value: string, icon: React.ReactNode, color: string) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.statGradient}
      >
        <View style={styles.statIcon}>
          {icon}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim
        }
      ]}
    >
      <LinearGradient
        colors={[Colors.background, '#F8FBFF']}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</Text>
          </View>
          
          {/* Sugar Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Today's Sugar Intake</Text>
            <SugarProgressBar currentSugar={todaysTotalSugar} />
            <Text style={styles.progressNote}>
              {todaysTotalSugar < 15 ? 'Great job staying within healthy limits!' : 
               todaysTotalSugar < 25 ? 'Getting close to your daily limit' :
               'Consider reducing sugar for the rest of the day'}
            </Text>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Foods',
                todaysFoods.length.toString(),
                <Target size={16} color="white" />,
                Colors.primary
              )}
              {renderStatCard(
                'Calories',
                stats.totalCalories > 0 ? stats.totalCalories.toString() : '0',
                <TrendingUp size={16} color="white" />,
                Colors.secondary
              )}
              {renderStatCard(
                'Hidden Sugars',
                stats.hiddenSugarCount.toString(),
                <AlertTriangle size={16} color="white" />,
                Colors.danger
              )}
            </View>
          </View>
          
          {/* Main Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Log Your Food</Text>
            
            <View style={styles.featuresGrid}>
              {renderFeatureCard(
                <Camera size={28} color="white" />,
                'Photo Analysis',
                'Snap & analyze instantly',
                () => handleNavigation('/log'),
                [Colors.primary, Colors.secondary],
                'large'
              )}
              
              <View style={styles.featuresRow}>
                {renderFeatureCard(
                  <Barcode size={24} color="white" />,
                  'Scan Barcode',
                  'Quick detection',
                  () => handleNavigation('/log'),
                  [Colors.secondary, Colors.accent]
                )}
                
                {renderFeatureCard(
                  <Plus size={24} color="white" />,
                  'Manual Entry',
                  'Add details',
                  () => handleNavigation('/food/add'),
                  [Colors.accent, '#FF6B8B']
                )}
              </View>
            </View>
          </View>
          
          {/* Food Diary */}
          <View style={styles.diarySection}>
            <TouchableOpacity 
              style={styles.diaryCard}
              onPress={() => handleNavigation('/')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B8B', '#FF8E8E']}
                style={styles.diaryGradient}
              >
                <BookOpen size={32} color="white" />
                <View style={styles.diaryText}>
                  <Text style={styles.diaryTitle}>Food Diary</Text>
                  <Text style={styles.diarySubtitle}>View your complete daily log</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Recent Foods */}
          {recentFoods.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Foods</Text>
              <View style={styles.recentContainer}>
                {recentFoods.map((food, index) => (
                  <TouchableOpacity 
                    key={food.id} 
                    style={styles.recentFood}
                    onPress={() => {
                      onClose();
                      router.push(`/food/${food.id}` as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentFoodInfo}>
                      <Text style={styles.recentFoodName}>{food.name}</Text>
                      <Text style={styles.recentFoodDetails}>
                        {food.sugarPerServing}g sugar • {new Date(food.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={[styles.recentFoodMeal, { backgroundColor: Colors.primary }]}>
                      <Text style={styles.recentFoodMealText}>
                        {food.mealType.charAt(0).toUpperCase() + food.mealType.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Additional Features */}
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Health & Insights</Text>
            
            <View style={styles.additionalGrid}>
              {renderFeatureCard(
                <BarChart2 size={24} color="white" />,
                'Insights',
                'Track patterns',
                () => handleNavigation('/insights'),
                [Colors.primary, '#6C5CE7']
              )}
              
              {renderFeatureCard(
                <Heart size={24} color="white" />,
                'Reflection',
                'Daily wellness',
                onReflectionPress,
                [Colors.accent, '#FF6B8B']
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => handleNavigation('/settings')}
              activeOpacity={0.7}
            >
              <Settings size={20} color={Colors.subtext} />
              <Text style={styles.settingsText}>Settings & Preferences</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer} />
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: Colors.subtext,
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: Colors.card,
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  progressNote: {
    fontSize: 14,
    color: Colors.subtext,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsSection: {
    margin: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresSection: {
    margin: 16,
    marginTop: 8,
  },
  featuresGrid: {
    gap: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featureCardLarge: {
    marginBottom: 12,
  },
  featureGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureGradientLarge: {
    minHeight: 140,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  diarySection: {
    margin: 16,
    marginTop: 8,
  },
  diaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  diaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  diaryText: {
    marginLeft: 16,
    flex: 1,
  },
  diaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  diarySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  recentSection: {
    margin: 16,
    marginTop: 8,
  },
  recentContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
  },
  recentFood: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  recentFoodInfo: {
    flex: 1,
  },
  recentFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  recentFoodDetails: {
    fontSize: 14,
    color: Colors.subtext,
  },
  recentFoodMeal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recentFoodMealText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  additionalSection: {
    margin: 16,
    marginTop: 8,
  },
  additionalGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 16,
    color: Colors.subtext,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  }
});