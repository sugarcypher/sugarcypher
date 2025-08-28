import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyLog, Food, SugarInsight, ReflectionData } from '@/types/food';
import { sampleFoods } from '@/mocks/sampleFoods';
import { DAILY_SUGAR_LIMIT_GRAMS } from '@/constants/sugarLimits';

interface FoodLogState {
  logs: Record<string, DailyLog>;
  todaysFoods: Food[];
  todaysTotalSugar: number;
  insights: SugarInsight[];
  isLoading: boolean;
  
  // Actions
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  updateFood: (food: Food) => void;
  clearToday: () => void;
  getLogForDate: (date: string) => DailyLog | null;
  calculateInsights: () => void;
  getSugarProgress: () => number; // 0-1 representing percentage of daily limit
  saveReflection: (reflection: ReflectionData) => void;
  getReflectionForDate: (date: string) => ReflectionData | null;
}

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const calculateTotalSugar = (foods: Food[]) => {
  return foods.reduce((total, food) => {
    const directSugar = food.sugarPerServing;
    const equivalentSugar = food.sugarEquivalent || 0;
    return total + directSugar + equivalentSugar;
  }, 0);
};

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      logs: {},
      todaysFoods: [],
      todaysTotalSugar: 0,
      insights: [],
      isLoading: true,
      
      addFood: (food: Food) => {
        const today = getTodayDateString();
        const updatedFoods = [...get().todaysFoods, food];
        const totalSugar = calculateTotalSugar(updatedFoods);
        
        set({
          todaysFoods: updatedFoods,
          todaysTotalSugar: totalSugar,
          logs: {
            ...get().logs,
            [today]: {
              ...get().logs[today],
              date: today,
              foods: updatedFoods,
              totalSugar: totalSugar,
              totalCalories: updatedFoods.reduce((total, food) => total + (food.calories || 0), 0)
            }
          }
        });
      },
      
      removeFood: (foodId: string) => {
        const today = getTodayDateString();
        const updatedFoods = get().todaysFoods.filter(food => food.id !== foodId);
        const totalSugar = calculateTotalSugar(updatedFoods);
        
        set({
          todaysFoods: updatedFoods,
          todaysTotalSugar: totalSugar,
          logs: {
            ...get().logs,
            [today]: {
              ...get().logs[today],
              date: today,
              foods: updatedFoods,
              totalSugar: totalSugar,
              totalCalories: updatedFoods.reduce((total, food) => total + (food.calories || 0), 0)
            }
          }
        });
      },
      
      updateFood: (updatedFood: Food) => {
        const today = getTodayDateString();
        const updatedFoods = get().todaysFoods.map(food => 
          food.id === updatedFood.id ? updatedFood : food
        );
        const totalSugar = calculateTotalSugar(updatedFoods);
        
        set({
          todaysFoods: updatedFoods,
          todaysTotalSugar: totalSugar,
          logs: {
            ...get().logs,
            [today]: {
              ...get().logs[today],
              date: today,
              foods: updatedFoods,
              totalSugar: totalSugar,
              totalCalories: updatedFoods.reduce((total, food) => total + (food.calories || 0), 0)
            }
          }
        });
      },
      
      clearToday: () => {
        const today = getTodayDateString();
        
        set({
          todaysFoods: [],
          todaysTotalSugar: 0,
          logs: {
            ...get().logs,
            [today]: {
              ...get().logs[today],
              date: today,
              foods: [],
              totalSugar: 0,
              totalCalories: 0
            }
          }
        });
      },
      
      getLogForDate: (date: string) => {
        return get().logs[date] || null;
      },
      
      saveReflection: (reflection: ReflectionData) => {
        const date = reflection.date;
        const currentLog = get().logs[date];
        
        set({
          logs: {
            ...get().logs,
            [date]: {
              ...currentLog,
              date,
              foods: currentLog?.foods || [],
              totalSugar: currentLog?.totalSugar || 0,
              totalCalories: currentLog?.totalCalories || 0,
              reflection
            }
          }
        });
      },
      
      getReflectionForDate: (date: string) => {
        const log = get().logs[date];
        return log?.reflection || null;
      },
      
      calculateInsights: () => {
        const logs = get().logs;
        const dates = Object.keys(logs).sort();
        
        if (dates.length === 0) {
          set({ insights: [] });
          return;
        }
        
        // Calculate daily average for the last 7 days
        const last7Days = dates.slice(-7);
        const weeklyTotal = last7Days.reduce((total, date) => total + logs[date].totalSugar, 0);
        const weeklyAverage = weeklyTotal / last7Days.length;
        
        // Count hidden sugars
        const hiddenSugarCount = last7Days.reduce((count, date) => {
          return count + logs[date].foods.reduce((foodCount, food) => {
            return foodCount + (food.hiddenSugars?.length || 0);
          }, 0);
        }, 0);
        
        // Calculate reflection correlations
        const reflections = last7Days
          .map(date => logs[date].reflection)
          .filter(r => r !== undefined) as ReflectionData[];
        
        let reflectionCorrelation;
        if (reflections.length >= 3) {
          const sugarAmounts = last7Days.map(date => logs[date].totalSugar);
          const energyLevels = reflections.map(r => r.energyLevel);
          const moodLevels = reflections.map(r => r.moodLevel);
          const cravingsLevels = reflections.map(r => r.cravings);
          
          // Simple correlation calculation (would use proper statistical methods in production)
          reflectionCorrelation = {
            energyCorrelation: calculateCorrelation(sugarAmounts, energyLevels),
            moodCorrelation: calculateCorrelation(sugarAmounts, moodLevels),
            cravingsCorrelation: calculateCorrelation(sugarAmounts, cravingsLevels)
          };
        }
        
        // Find highest and lowest days
        let highestDay = { date: dates[0], amount: logs[dates[0]].totalSugar };
        let lowestDay = { date: dates[0], amount: logs[dates[0]].totalSugar };
        
        last7Days.forEach(date => {
          const amount = logs[date].totalSugar;
          if (amount > highestDay.amount) {
            highestDay = { date, amount };
          }
          if (amount < lowestDay.amount) {
            lowestDay = { date, amount };
          }
        });
        
        // Determine trend
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (last7Days.length >= 3) {
          const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2));
          const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2));
          
          const firstHalfAvg = firstHalf.reduce((total, date) => total + logs[date].totalSugar, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((total, date) => total + logs[date].totalSugar, 0) / secondHalf.length;
          
          if (secondHalfAvg > firstHalfAvg * 1.1) {
            trend = 'increasing';
          } else if (secondHalfAvg < firstHalfAvg * 0.9) {
            trend = 'decreasing';
          }
        }
        
        const weeklyInsight: SugarInsight = {
          type: 'weekly',
          period: `${last7Days[0]} to ${last7Days[last7Days.length - 1]}`,
          averageSugar: weeklyAverage,
          highestDay,
          lowestDay,
          trend,
          hiddenSugarCount,
          reflectionCorrelation
        };
        
        set({ insights: [weeklyInsight] });
      },
      
      getSugarProgress: () => {
        return Math.min(get().todaysTotalSugar / DAILY_SUGAR_LIMIT_GRAMS, 1);
      }
    }),
    {
      name: 'food-log-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize today's data if it doesn't exist
          const today = getTodayDateString();
          if (!state.logs[today]) {
            state.logs[today] = {
              date: today,
              foods: [],
              totalSugar: 0
            };
          }
          
          // Set today's foods
          state.todaysFoods = state.logs[today].foods;
          state.todaysTotalSugar = state.logs[today].totalSugar;
          
          // Calculate insights
          state.calculateInsights();
          state.isLoading = false;
        }
      }
    }
  )
);

// Simple correlation calculation helper
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Initialize with sample data if needed (for development)
export const initializeWithSampleData = async () => {
  const store = useFoodLogStore.getState();
  if (store.isLoading) return; // Wait for rehydration
  
  const today = getTodayDateString();
  if (!store.logs[today] || store.logs[today].foods.length === 0) {
    sampleFoods.forEach(food => {
      store.addFood({
        ...food,
        timestamp: Date.now() - Math.random() * 36000000 // Random time in the last 10 hours
      });
    });
  }
};