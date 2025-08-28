export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  sugarPerServing: number; // in grams
  servingSize: string;
  servingSizeGrams?: number;
  hiddenSugars: string[];
  hiddenSugarTypes?: import('@/constants/hiddenSugarTypes').HiddenSugarType[];
  imageUri?: string;
  timestamp: number;
  mealType: MealType;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  ingredients?: string[];
  glycemicIndex?: number;
  sugarEquivalent?: number; // for high-glycemic foods that convert to sugar
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  foods: Food[];
  totalSugar: number;
  totalCalories?: number;
  reflection?: ReflectionData;
}

export interface ReflectionData {
  date: string;
  energyLevel: number; // 1-5
  moodLevel: number; // 1-5
  cravings: number; // 1-5
  notes: string;
}

export interface SugarInsight {
  type: 'daily' | 'weekly' | 'monthly';
  period: string;
  averageSugar: number;
  highestDay?: {
    date: string;
    amount: number;
  };
  lowestDay?: {
    date: string;
    amount: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  hiddenSugarCount?: number;
  reflectionCorrelation?: {
    energyCorrelation: number; // -1 to 1
    moodCorrelation: number; // -1 to 1
    cravingsCorrelation: number; // -1 to 1
  };
}

export interface HiddenSugar {
  name: string;
  aliases: string[];
  description: string;
}