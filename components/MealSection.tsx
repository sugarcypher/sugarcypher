import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Food, MealType } from '@/types/food';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Utensils } from 'lucide-react-native';
import FoodCard from './FoodCard';
import EnterpriseCard from './ui/EnterpriseCard';

interface MealSectionProps {
  title: string;
  foods: Food[];
  mealType: MealType;
  onFoodPress: (food: Food) => void;
  onFoodDelete: (foodId: string) => void;
}

export default function MealSection({ 
  title, 
  foods, 
  mealType, 
  onFoodPress, 
  onFoodDelete 
}: MealSectionProps) {
  const mealFoods = foods.filter(food => food.mealType === mealType);
  
  if (mealFoods.length === 0) {
    return null;
  }
  
  const totalSugar = mealFoods.reduce((sum, food) => sum + food.sugarPerServing, 0);
  
  const getMealIcon = (mealType: MealType) => {
    return <Utensils size={20} color={PremiumColors.brand.primary} />;
  };
  
  const getSugarSeverityColor = (sugar: number) => {
    if (sugar > 15) return PremiumColors.semantic.error;
    if (sugar > 10) return PremiumColors.semantic.warning;
    return PremiumColors.semantic.success;
  };
  
  return (
    <EnterpriseCard variant="elevated" shadow="md" style={styles.container}>
      <LinearGradient
        colors={[PremiumColors.background.elevated, PremiumColors.background.surface]}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.header} activeOpacity={0.8}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              {getMealIcon(mealType)}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.foodCount}>{mealFoods.length} item{mealFoods.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.sugarBadge}>
              <Text style={[styles.sugarTotal, { color: getSugarSeverityColor(totalSugar) }]}>
                {totalSugar.toFixed(1)}g
              </Text>
              <Text style={styles.sugarLabel}>sugar</Text>
            </View>
            <ChevronRight size={16} color={PremiumColors.text.tertiary} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.foodList}>
          {mealFoods.map((food, index) => (
            <View key={food.id} style={[styles.foodCardContainer, index === mealFoods.length - 1 && styles.lastFoodCard]}>
              <FoodCard 
                food={food} 
                onPress={() => onFoodPress(food)}
                onDelete={() => onFoodDelete(food.id)}
                showTime={false}
              />
            </View>
          ))}
        </View>
      </LinearGradient>
    </EnterpriseCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PremiumColors.brand.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: PremiumColors.brand.primary + '30',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...DesignSystem.typography.h4,
    color: PremiumColors.text.primary,
    fontWeight: '700',
  },
  foodCount: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.tertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  sugarBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sugarTotal: {
    ...DesignSystem.typography.h4,
    fontWeight: '700',
  },
  sugarLabel: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.tertiary,
    marginTop: -2,
  },
  foodList: {
    gap: DesignSystem.spacing.xs,
  },
  foodCardContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: DesignSystem.spacing.xs,
  },
  lastFoodCard: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
});