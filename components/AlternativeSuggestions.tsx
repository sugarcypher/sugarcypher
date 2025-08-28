import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import { Lightbulb, ArrowRight } from 'lucide-react-native';
import { MealType } from '@/types/food';

interface Alternative {
  name: string;
  sugarContent: number;
  benefits: string[];
  category: string;
}

interface AlternativeSuggestionsProps {
  foodName: string;
  currentSugar: number;
  mealType?: MealType;
  onSelectAlternative?: (alternative: Alternative) => void;
}

const getAlternatives = (foodName: string, currentSugar: number, mealType?: MealType): Alternative[] => {
  const name = foodName.toLowerCase();
  
  // Determine food category from name and context
  const isBeverage = name.includes('soda') || name.includes('cola') || name.includes('soft drink') || 
                    name.includes('juice') || name.includes('smoothie') || name.includes('drink') ||
                    name.includes('tea') || name.includes('coffee') || name.includes('latte') ||
                    name.includes('frappuccino') || name.includes('beverage') || name.includes('water');
  
  const isSnack = name.includes('candy') || name.includes('chocolate') || name.includes('cookie') ||
                  name.includes('chip') || name.includes('bar') || name.includes('cracker') ||
                  name.includes('nuts') || name.includes('popcorn') || mealType === 'snack';
  
  const isBreakfast = name.includes('cereal') || name.includes('granola') || name.includes('muffin') ||
                     name.includes('pancake') || name.includes('waffle') || name.includes('toast') ||
                     name.includes('yogurt') || mealType === 'breakfast';
  
  const isDessert = name.includes('cake') || name.includes('pie') || name.includes('ice cream') ||
                   name.includes('donut') || name.includes('pastry') || name.includes('brownie');
  
  const isMainMeal = mealType === 'lunch' || mealType === 'dinner';
  
  // Beverage alternatives
  if (isBeverage) {
    return [
      {
        name: 'Sparkling water with lemon',
        sugarContent: 0,
        benefits: ['Zero sugar', 'Hydrating', 'Natural flavor'],
        category: 'Beverage'
      },
      {
        name: 'Unsweetened iced tea',
        sugarContent: 0,
        benefits: ['Antioxidants', 'No added sugar', 'Refreshing'],
        category: 'Beverage'
      },
      {
        name: 'Kombucha (low sugar)',
        sugarContent: 2,
        benefits: ['Probiotics', 'Lower sugar', 'Gut health'],
        category: 'Beverage'
      },
      {
        name: 'Coconut water',
        sugarContent: 6,
        benefits: ['Natural electrolytes', 'Lower sugar', 'Hydrating'],
        category: 'Beverage'
      }
    ];
  }
  
  // Snack alternatives
  if (isSnack) {
    return [
      {
        name: 'Mixed nuts',
        sugarContent: 1,
        benefits: ['Healthy fats', 'Protein', 'Fiber'],
        category: 'Snack'
      },
      {
        name: 'Apple with almond butter',
        sugarContent: 12,
        benefits: ['Natural sugars', 'Fiber', 'Protein'],
        category: 'Snack'
      },
      {
        name: 'Dark chocolate (85% cacao)',
        sugarContent: 7,
        benefits: ['Antioxidants', 'Lower sugar', 'Satisfying'],
        category: 'Snack'
      },
      {
        name: 'Greek yogurt with berries',
        sugarContent: 8,
        benefits: ['Protein', 'Natural sugars', 'Probiotics'],
        category: 'Snack'
      }
    ];
  }
  
  // Breakfast alternatives
  if (isBreakfast) {
    return [
      {
        name: 'Steel-cut oats with berries',
        sugarContent: 8,
        benefits: ['Fiber', 'Natural sugars', 'Sustained energy'],
        category: 'Breakfast'
      },
      {
        name: 'Greek yogurt with nuts',
        sugarContent: 5,
        benefits: ['Protein', 'Probiotics', 'Lower sugar'],
        category: 'Breakfast'
      },
      {
        name: 'Avocado toast',
        sugarContent: 2,
        benefits: ['Healthy fats', 'Fiber', 'Very low sugar'],
        category: 'Breakfast'
      },
      {
        name: 'Scrambled eggs with spinach',
        sugarContent: 1,
        benefits: ['High protein', 'Vitamins', 'Almost no sugar'],
        category: 'Breakfast'
      }
    ];
  }
  
  // Dessert alternatives
  if (isDessert) {
    return [
      {
        name: 'Fresh berries with cream',
        sugarContent: 8,
        benefits: ['Natural sugars', 'Antioxidants', 'Lower calories'],
        category: 'Dessert'
      },
      {
        name: 'Dark chocolate square',
        sugarContent: 5,
        benefits: ['Antioxidants', 'Portion control', 'Satisfying'],
        category: 'Dessert'
      },
      {
        name: 'Greek yogurt with honey',
        sugarContent: 12,
        benefits: ['Protein', 'Natural sweetener', 'Probiotics'],
        category: 'Dessert'
      }
    ];
  }
  
  // Main meal alternatives (for high-sugar main dishes)
  if (isMainMeal && currentSugar > 10) {
    return [
      {
        name: 'Grilled protein with vegetables',
        sugarContent: 3,
        benefits: ['High protein', 'Fiber', 'Very low sugar'],
        category: 'Main dish'
      },
      {
        name: 'Quinoa salad with herbs',
        sugarContent: 4,
        benefits: ['Complete protein', 'Fiber', 'Nutrient dense'],
        category: 'Main dish'
      },
      {
        name: 'Cauliflower rice stir-fry',
        sugarContent: 6,
        benefits: ['Low carb', 'Vegetables', 'Lower sugar'],
        category: 'Main dish'
      }
    ];
  }
  
  // Generic alternatives for high-sugar foods
  if (currentSugar > 15) {
    return [
      {
        name: 'Fresh fruit salad',
        sugarContent: Math.max(8, Math.round(currentSugar * 0.4)),
        benefits: ['Natural sugars', 'Vitamins', 'Fiber'],
        category: 'Healthy swap'
      },
      {
        name: 'Vegetable sticks with hummus',
        sugarContent: 3,
        benefits: ['Very low sugar', 'Fiber', 'Protein'],
        category: 'Healthy swap'
      }
    ];
  }
  
  return [];
};

export default function AlternativeSuggestions({ 
  foodName, 
  currentSugar, 
  mealType,
  onSelectAlternative 
}: AlternativeSuggestionsProps) {
  const alternatives = getAlternatives(foodName, currentSugar, mealType);
  
  if (alternatives.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={20} color={Colors.primary} />
        <Text style={styles.title}>Healthier Alternatives</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Consider these lower-sugar options instead:
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {alternatives.map((alternative, index) => (
          <TouchableOpacity
            key={index}
            style={styles.alternativeCard}
            onPress={() => onSelectAlternative?.(alternative)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.alternativeName}>{alternative.name}</Text>
              <Text style={styles.category}>{alternative.category}</Text>
            </View>
            
            <View style={styles.sugarComparison}>
              <Text style={styles.sugarReduction}>
                {currentSugar - alternative.sugarContent > 0 
                  ? `-${(currentSugar - alternative.sugarContent).toFixed(1)}g sugar`
                  : `${alternative.sugarContent}g sugar`
                }
              </Text>
            </View>
            
            <View style={styles.benefits}>
              {alternative.benefits.slice(0, 2).map((benefit, idx) => (
                <Text key={idx} style={styles.benefit}>• {benefit}</Text>
              ))}
            </View>
            
            <View style={styles.cardFooter}>
              <ArrowRight size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  alternativeCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    width: 180,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    marginBottom: 8,
  },
  alternativeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    color: Colors.primary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  sugarComparison: {
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sugarReduction: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  benefits: {
    flex: 1,
    marginBottom: 8,
  },
  benefit: {
    fontSize: 11,
    color: Colors.text,
    marginBottom: 2,
  },
  cardFooter: {
    alignItems: 'flex-end',
  }
});