import { Food } from '@/types/food';
import { findHiddenSugars } from '@/constants/hiddenSugarTypes';

export const generateFoodId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createFoodFromBarcode = (
  barcodeData: { name: string; brand?: string; sugarPerServing: number; ingredients?: string },
  barcode: string
): Food => {
  const hiddenSugarTypes = barcodeData.ingredients 
    ? findHiddenSugars(barcodeData.ingredients) 
    : [];
  
  const hiddenSugars = hiddenSugarTypes.map(sugar => sugar.name);
  
  return {
    id: generateFoodId(),
    name: barcodeData.name,
    brand: barcodeData.brand,
    barcode,
    sugarPerServing: barcodeData.sugarPerServing,
    servingSize: '1 serving',
    hiddenSugars,
    hiddenSugarTypes,
    timestamp: Date.now(),
    mealType: getCurrentMealType(),
    ingredients: barcodeData.ingredients?.split(',').map(i => i.trim())
  };
};

export const createFoodFromAI = (
  aiData: { 
    name: string; 
    sugarEstimate: number; 
    ingredients?: string[];
    calories?: number;
    glycemicIndex?: number;
    sugarEquivalent?: number;
  }
): Food => {
  const ingredientsString = aiData.ingredients?.join(', ') || '';
  const hiddenSugarTypes = findHiddenSugars(ingredientsString);
  const hiddenSugars = hiddenSugarTypes.map(sugar => sugar.name);
  
  return {
    id: generateFoodId(),
    name: aiData.name,
    sugarPerServing: aiData.sugarEstimate,
    servingSize: '1 serving',
    hiddenSugars,
    hiddenSugarTypes,
    timestamp: Date.now(),
    mealType: getCurrentMealType(),
    calories: aiData.calories,
    ingredients: aiData.ingredients,
    glycemicIndex: aiData.glycemicIndex,
    sugarEquivalent: aiData.sugarEquivalent
  };
};

export const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 10) {
    return 'breakfast';
  } else if (hour >= 10 && hour < 14) {
    return 'lunch';
  } else if (hour >= 17 && hour < 21) {
    return 'dinner';
  } else {
    return 'snack';
  }
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const calculateTotalSugarEquivalent = (foods: Food[]): number => {
  return foods.reduce((total, food) => {
    const directSugar = food.sugarPerServing;
    const equivalentSugar = food.sugarEquivalent || 0;
    return total + directSugar + equivalentSugar;
  }, 0);
};