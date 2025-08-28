import { Food } from '@/types/food';
import { findHiddenSugars } from '@/constants/hiddenSugarTypes';

export const sampleFoods: Food[] = [
  {
    id: '1',
    name: 'Greek Yogurt',
    brand: 'Fage',
    sugarPerServing: 5,
    servingSize: '1 container (170g)',
    servingSizeGrams: 170,
    hiddenSugars: [],
    hiddenSugarTypes: [],
    timestamp: Date.now() - 3600000, // 1 hour ago
    mealType: 'breakfast',
    calories: 100,
    carbs: 6,
    protein: 18,
    fat: 0,
  },
  {
    id: '2',
    name: 'Granola Bar',
    brand: 'Nature Valley',
    barcode: '123456789012',
    sugarPerServing: 12,
    servingSize: '1 bar (42g)',
    servingSizeGrams: 42,
    hiddenSugars: ['High-fructose corn syrup', 'Brown sugar syrup'],
    hiddenSugarTypes: findHiddenSugars('High-fructose corn syrup, Brown sugar syrup, Honey'),
    timestamp: Date.now() - 7200000, // 2 hours ago
    mealType: 'snack',
    calories: 180,
    carbs: 29,
    protein: 3,
    fat: 6,
    ingredients: ['Whole Grain Oats', 'Sugar', 'Canola Oil', 'Rice Flour', 'Honey', 'Brown Sugar Syrup', 'Salt', 'Natural Flavor']
  },
  {
    id: '3',
    name: 'Soda',
    brand: 'Coca-Cola',
    barcode: '049000006346',
    sugarPerServing: 39,
    servingSize: '1 can (355ml)',
    servingSizeGrams: 355,
    hiddenSugars: ['High-fructose corn syrup'],
    hiddenSugarTypes: findHiddenSugars('High-fructose corn syrup'),
    timestamp: Date.now() - 10800000, // 3 hours ago
    mealType: 'snack',
    calories: 140,
    carbs: 39,
    protein: 0,
    fat: 0,
    ingredients: ['Carbonated Water', 'High Fructose Corn Syrup', 'Caramel Color', 'Phosphoric Acid', 'Natural Flavors', 'Caffeine']
  },
  {
    id: '4',
    name: 'White Bread',
    sugarPerServing: 2,
    servingSize: '2 slices (60g)',
    servingSizeGrams: 60,
    hiddenSugars: [],
    hiddenSugarTypes: [],
    timestamp: Date.now() - 14400000, // 4 hours ago
    mealType: 'lunch',
    calories: 160,
    carbs: 30,
    protein: 4,
    fat: 2,
    glycemicIndex: 75,
    sugarEquivalent: 8, // High glycemic impact
    ingredients: ['Enriched Wheat Flour', 'Water', 'Sugar', 'Yeast', 'Salt']
  },
  {
    id: '5',
    name: 'Fruit Smoothie',
    brand: 'Innocent',
    sugarPerServing: 26,
    servingSize: '1 bottle (250ml)',
    servingSizeGrams: 250,
    hiddenSugars: ['Fruit juice concentrate'],
    hiddenSugarTypes: findHiddenSugars('Apple juice concentrate, Grape juice concentrate'),
    timestamp: Date.now() - 18000000, // 5 hours ago
    mealType: 'breakfast',
    calories: 180,
    carbs: 42,
    protein: 2,
    fat: 0,
    ingredients: ['Apple Juice', 'Banana', 'Mango', 'Apple Juice Concentrate', 'Grape Juice Concentrate', 'Natural Flavors']
  }
];