import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';
import { Camera, QrCode, Plus, Calendar, Target, Award, Flame, Clock, BarChart3, Zap, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EnterpriseCard from '@/components/ui/EnterpriseCard';
import { useFoodLogStore } from '@/store/foodLogStore';
import FoodCard from '@/components/FoodCard';
import MealSection from '@/components/MealSection';
import DateSelector from '@/components/DateSelector';
import SugarProgressBar from '@/components/SugarProgressBar';
import EmptyState from '@/components/EmptyState';
import { Food, MealType } from '@/types/food';
import { DAILY_SUGAR_LIMIT_GRAMS } from '@/constants/sugarLimits';

const { width: screenWidth } = Dimensions.get('window');

export default function LogFoodScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const { 
    todaysFoods, 
    todaysTotalSugar, 
    getLogForDate, 
    removeFood, 
    calculateInsights,
    getSugarProgress
  } = useFoodLogStore();
  
  const dateString = selectedDate.toISOString().split('T')[0];
  const isToday = dateString === new Date().toISOString().split('T')[0];
  const currentLog = isToday ? { foods: todaysFoods, totalSugar: todaysTotalSugar } : getLogForDate(dateString);
  const foods = currentLog?.foods || [];
  const totalSugar = currentLog?.totalSugar || 0;
  
  const handleTakePhoto = () => {
    console.log('Take photo pressed');
    router.push('/scanner');
  };
  
  const handleScanBarcode = () => {
    console.log('Scan barcode pressed');
    router.push('/scanner');
  };
  
  const handleManualEntry = () => {
    console.log('Manual entry pressed');
    router.push('/food/add');
  };
  
  const handleFoodPress = (food: Food) => {
    router.push(`/food/${food.id}`);
  };
  
  const handleFoodDelete = (foodId: string) => {
    if (isToday) {
      removeFood(foodId);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    calculateInsights();
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const getMealFoods = useCallback((mealType: MealType) => {
    return foods.filter(food => food.mealType === mealType);
  }, [foods]);
  
  const sugarProgress = getSugarProgress();
  
  // Enhanced analytics
  const analytics = useMemo(() => {
    const mealBreakdown = {
      breakfast: getMealFoods('breakfast').reduce((sum, food) => sum + food.sugarPerServing, 0),
      lunch: getMealFoods('lunch').reduce((sum, food) => sum + food.sugarPerServing, 0),
      dinner: getMealFoods('dinner').reduce((sum, food) => sum + food.sugarPerServing, 0),
      snack: getMealFoods('snack').reduce((sum, food) => sum + food.sugarPerServing, 0),
    };
    
    const highestMeal = Object.entries(mealBreakdown).reduce((a, b) => a[1] > b[1] ? a : b, ['none', 0]);
    const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
    const avgSugarPerFood = foods.length > 0 ? totalSugar / foods.length : 0;
    
    return {
      mealBreakdown,
      highestMeal,
      totalCalories,
      avgSugarPerFood,
      progressPercentage: Math.round(sugarProgress * 100),
      remainingSugar: Math.max(0, DAILY_SUGAR_LIMIT_GRAMS - totalSugar),
      isOverLimit: totalSugar > DAILY_SUGAR_LIMIT_GRAMS
    };
  }, [foods, totalSugar, sugarProgress, getMealFoods]);
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={PremiumColors.background.primary} />
      <Stack.Screen options={{ 
        title: 'Food Log',
        headerStyle: {
          backgroundColor: PremiumColors.background.primary,
        },
        headerTitleStyle: {
          ...DesignSystem.typography.h3,
          color: PremiumColors.text.primary,
        },
        headerTintColor: PremiumColors.text.primary,
        headerRight: () => (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/insights')}
          >
            <BarChart3 size={24} color={PremiumColors.brand.primary} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PremiumColors.brand.primary}
            colors={[PremiumColors.brand.primary]}
          />
        }
      >
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <EnterpriseCard variant="elevated" shadow="sm">
            <DateSelector 
              currentDate={selectedDate} 
              onDateChange={setSelectedDate} 
            />
          </EnterpriseCard>
        </View>
        
        {/* Enhanced Analytics Dashboard */}
        {foods.length > 0 && (
          <View style={styles.analyticsSection}>
            {/* Main Progress Card */}
            <EnterpriseCard variant="elevated" shadow="lg">
              <LinearGradient
                colors={analytics.isOverLimit ? 
                  [PremiumColors.semantic.error + '20', PremiumColors.semantic.errorDark + '10'] :
                  [PremiumColors.brand.primary + '20', PremiumColors.brand.primaryDark + '10']
                }
                style={styles.progressGradient}
              >
                <View style={styles.progressHeader}>
                  <View style={styles.progressTitleContainer}>
                    <Target size={24} color={analytics.isOverLimit ? PremiumColors.semantic.error : PremiumColors.brand.primary} />
                    <View>
                      <Text style={styles.progressTitle}>Daily Sugar Intake</Text>
                      <Text style={styles.progressSubtitle}>
                        {analytics.isOverLimit ? 'Over limit' : `${analytics.remainingSugar.toFixed(1)}g remaining`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressValueContainer}>
                    <Text style={[styles.progressValue, { color: analytics.isOverLimit ? PremiumColors.semantic.error : PremiumColors.brand.primary }]}>
                      {totalSugar.toFixed(1)}g
                    </Text>
                    <Text style={styles.progressLimit}>/ {DAILY_SUGAR_LIMIT_GRAMS}g</Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <SugarProgressBar 
                    currentSugar={totalSugar} 
                    showLabel={false}
                    height={20}
                  />
                  <Text style={styles.progressPercentage}>{analytics.progressPercentage}%</Text>
                </View>
                
                {/* Quick Stats Grid */}
                <View style={styles.quickStatsGrid}>
                  <View style={styles.quickStat}>
                    <View style={styles.quickStatIcon}>
                      <Flame size={16} color={PremiumColors.semantic.warning} />
                    </View>
                    <Text style={styles.quickStatValue}>{analytics.totalCalories}</Text>
                    <Text style={styles.quickStatLabel}>Calories</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <View style={styles.quickStatIcon}>
                      <Award size={16} color={PremiumColors.semantic.success} />
                    </View>
                    <Text style={styles.quickStatValue}>{foods.length}</Text>
                    <Text style={styles.quickStatLabel}>Foods</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <View style={styles.quickStatIcon}>
                      <Zap size={16} color={PremiumColors.brand.secondary} />
                    </View>
                    <Text style={styles.quickStatValue}>{analytics.avgSugarPerFood.toFixed(1)}g</Text>
                    <Text style={styles.quickStatLabel}>Avg Sugar</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <View style={styles.quickStatIcon}>
                      <Clock size={16} color={PremiumColors.text.tertiary} />
                    </View>
                    <Text style={styles.quickStatValue}>{analytics.highestMeal[0]}</Text>
                    <Text style={styles.quickStatLabel}>Highest</Text>
                  </View>
                </View>
              </LinearGradient>
            </EnterpriseCard>
            
            {/* Meal Breakdown Cards */}
            <View style={styles.mealBreakdownContainer}>
              {Object.entries(analytics.mealBreakdown).map(([meal, sugar]) => {
                if (sugar === 0) return null;
                const percentage = totalSugar > 0 ? (sugar / totalSugar) * 100 : 0;
                return (
                  <EnterpriseCard key={meal} variant="elevated" shadow="sm" style={styles.mealBreakdownCard}>
                    <View style={styles.mealBreakdownHeader}>
                      <Text style={styles.mealBreakdownTitle}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                      <Text style={styles.mealBreakdownValue}>{sugar.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.mealBreakdownBar}>
                      <View 
                        style={[
                          styles.mealBreakdownFill, 
                          { 
                            width: `${percentage}%`,
                            backgroundColor: meal === analytics.highestMeal[0] ? PremiumColors.semantic.warning : PremiumColors.brand.primary
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.mealBreakdownPercentage}>{percentage.toFixed(0)}% of daily</Text>
                  </EnterpriseCard>
                );
              })}
            </View>
          </View>
        )}
        
        {/* Food Log Content */}
        {foods.length > 0 ? (
          <View style={styles.logContent}>
            {/* Breakfast */}
            {getMealFoods('breakfast').length > 0 && (
              <MealSection
                title="Breakfast"
                foods={foods}
                mealType="breakfast"
                onFoodPress={handleFoodPress}
                onFoodDelete={handleFoodDelete}
              />
            )}
            
            {/* Lunch */}
            {getMealFoods('lunch').length > 0 && (
              <MealSection
                title="Lunch"
                foods={foods}
                mealType="lunch"
                onFoodPress={handleFoodPress}
                onFoodDelete={handleFoodDelete}
              />
            )}
            
            {/* Dinner */}
            {getMealFoods('dinner').length > 0 && (
              <MealSection
                title="Dinner"
                foods={foods}
                mealType="dinner"
                onFoodPress={handleFoodPress}
                onFoodDelete={handleFoodDelete}
              />
            )}
            
            {/* Snacks */}
            {getMealFoods('snack').length > 0 && (
              <MealSection
                title="Snacks"
                foods={foods}
                mealType="snack"
                onFoodPress={handleFoodPress}
                onFoodDelete={handleFoodDelete}
              />
            )}
            
            {/* Other/Uncategorized */}
            {foods.filter(food => !food.mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(food.mealType)).length > 0 && (
              <View style={styles.mealSection}>
                <Text style={styles.mealTitle}>Other</Text>
                {foods
                  .filter(food => !food.mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(food.mealType))
                  .map(food => (
                    <FoodCard 
                      key={food.id} 
                      food={food} 
                      onPress={() => handleFoodPress(food)}
                      onDelete={isToday ? () => handleFoodDelete(food.id) : undefined}
                    />
                  ))
                }
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title={isToday ? "No foods logged today" : "No foods logged"}
              message={isToday ? "Start by adding your first meal or snack" : "No food entries found for this date"}
              icon={<Calendar size={60} color={PremiumColors.text.tertiary} />}
            />
          </View>
        )}
        
        {/* Enhanced Quick Actions - Only show for today */}
        {isToday && (
          <View style={styles.quickActionsSection}>
            <EnterpriseCard variant="elevated" shadow="xl">
              <LinearGradient
                colors={[PremiumColors.background.elevated, PremiumColors.background.surface]}
                style={styles.quickAddGradient}
              >
                <View style={styles.quickAddHeader}>
                  <View style={styles.quickAddTitleContainer}>
                    <View style={styles.quickAddIconContainer}>
                      <Plus size={24} color={PremiumColors.brand.primary} />
                    </View>
                    <View>
                      <Text style={styles.quickAddTitle}>Add Food</Text>
                      <Text style={styles.quickAddSubtitle}>Choose your preferred logging method</Text>
                    </View>
                  </View>
                  {analytics.isOverLimit && (
                    <View style={styles.warningBadge}>
                      <AlertCircle size={16} color={PremiumColors.semantic.error} />
                      <Text style={styles.warningText}>Over Limit</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={[styles.quickActionCard, styles.primaryAction]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[PremiumColors.brand.primary, PremiumColors.brand.primaryDark]}
                      style={styles.quickActionGradient}
                    >
                      <View style={styles.quickActionIcon}>
                        <Camera size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickActionTitle}>Photo Scan</Text>
                      <Text style={styles.quickActionDescription}>AI-powered food recognition</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.quickActionCard, styles.secondaryAction]}
                    onPress={handleScanBarcode}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[PremiumColors.brand.secondary, PremiumColors.brand.secondaryLight]}
                      style={styles.quickActionGradient}
                    >
                      <View style={styles.quickActionIcon}>
                        <QrCode size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickActionTitle}>Barcode</Text>
                      <Text style={styles.quickActionDescription}>Scan product labels</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.quickActionCard, styles.tertiaryAction]}
                    onPress={handleManualEntry}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[PremiumColors.semantic.success, PremiumColors.semantic.successDark]}
                      style={styles.quickActionGradient}
                    >
                      <View style={styles.quickActionIcon}>
                        <Plus size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickActionTitle}>Manual</Text>
                      <Text style={styles.quickActionDescription}>Enter food details</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </EnterpriseCard>
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PremiumColors.background.primary,
  },
  
  // Header
  headerButton: {
    padding: DesignSystem.spacing.sm,
    marginRight: DesignSystem.spacing.sm,
  },
  
  // Date Section
  dateSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.sm,
  },
  
  // Enhanced Analytics Section
  analyticsSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  progressGradient: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.lg,
  },
  progressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
    flex: 1,
  },
  progressTitle: {
    ...DesignSystem.typography.h3,
    color: PremiumColors.text.primary,
    fontWeight: '700',
  },
  progressSubtitle: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.tertiary,
    marginTop: 2,
  },
  progressValueContainer: {
    alignItems: 'flex-end',
  },
  progressValue: {
    ...DesignSystem.typography.display,
    fontWeight: '900',
    fontSize: 32,
    lineHeight: 36,
  },
  progressLimit: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.tertiary,
    marginTop: -4,
  },
  progressBarContainer: {
    marginBottom: DesignSystem.spacing.lg,
    position: 'relative',
  },
  progressPercentage: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.secondary,
    textAlign: 'right',
    marginTop: DesignSystem.spacing.xs,
    fontWeight: '600',
  },
  
  // Quick Stats Grid
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DesignSystem.spacing.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatIcon: {
    marginBottom: DesignSystem.spacing.xs,
  },
  quickStatValue: {
    ...DesignSystem.typography.h4,
    color: PremiumColors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickStatLabel: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.tertiary,
    textAlign: 'center',
  },
  
  // Meal Breakdown
  mealBreakdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
    marginTop: DesignSystem.spacing.md,
  },
  mealBreakdownCard: {
    flex: 1,
    minWidth: (screenWidth - DesignSystem.spacing.lg * 2 - DesignSystem.spacing.sm) / 2,
    padding: DesignSystem.spacing.md,
  },
  mealBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  mealBreakdownTitle: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.secondary,
    fontWeight: '600',
  },
  mealBreakdownValue: {
    ...DesignSystem.typography.h4,
    color: PremiumColors.text.primary,
    fontWeight: '700',
  },
  mealBreakdownBar: {
    height: 4,
    backgroundColor: PremiumColors.background.surface,
    borderRadius: 2,
    marginVertical: DesignSystem.spacing.xs,
    overflow: 'hidden',
  },
  mealBreakdownFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealBreakdownPercentage: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.tertiary,
  },
  
  // Log Content
  logContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  mealSection: {
    marginBottom: DesignSystem.spacing.xl,
  },
  mealTitle: {
    ...DesignSystem.typography.h3,
    color: PremiumColors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    fontWeight: '600',
  },
  
  // Empty State
  emptyStateContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xl * 2,
  },
  
  // Enhanced Quick Actions
  quickActionsSection: {
    paddingTop: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  quickAddGradient: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  quickAddHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  quickAddTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
    flex: 1,
  },
  quickAddIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PremiumColors.brand.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PremiumColors.brand.primary + '40',
  },
  quickAddTitle: {
    ...DesignSystem.typography.h3,
    color: PremiumColors.text.primary,
    fontWeight: '700',
  },
  quickAddSubtitle: {
    ...DesignSystem.typography.body2,
    color: PremiumColors.text.secondary,
    marginTop: 2,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    backgroundColor: PremiumColors.semantic.error + '20',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 1,
    borderColor: PremiumColors.semantic.error + '40',
  },
  warningText: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.semantic.error,
    fontWeight: '600',
  },
  quickActionsGrid: {
    gap: DesignSystem.spacing.md,
  },
  quickActionCard: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.sm,
    ...DesignSystem.shadows.md,
  },
  quickActionGradient: {
    padding: DesignSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    ...DesignSystem.typography.h4,
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
  },
  quickActionDescription: {
    ...DesignSystem.typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    flex: 1,
  },
  primaryAction: {
    // Primary action styles handled by gradient
  },
  secondaryAction: {
    // Secondary action styles handled by gradient
  },
  tertiaryAction: {
    // Tertiary action styles handled by gradient
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: DesignSystem.spacing.xl * 2,
  },
});