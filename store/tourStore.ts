import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TourState {
  hasCompletedTour: boolean;
  showTour: boolean;
  currentTourStep: number;
  setHasCompletedTour: (completed: boolean) => void;
  setShowTour: (show: boolean) => void;
  setCurrentTourStep: (step: number) => void;
  initializeTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  resetTour: () => Promise<void>;
}

const TOUR_STORAGE_KEY = '@sugarcypher_tour_completed';

export const useTourStore = create<TourState>((set, get) => ({
  hasCompletedTour: false,
  showTour: false,
  currentTourStep: 0,

  setHasCompletedTour: (completed: boolean) => {
    set({ hasCompletedTour: completed });
  },

  setShowTour: (show: boolean) => {
    set({ showTour: show });
  },

  setCurrentTourStep: (step: number) => {
    set({ currentTourStep: step });
  },

  initializeTour: async () => {
    try {
      console.log('Initializing tour...');
      const tourCompleted = await AsyncStorage.getItem(TOUR_STORAGE_KEY);
      const hasCompleted = tourCompleted === 'true';
      
      console.log('Tour status from storage:', { tourCompleted, hasCompleted });
      
      set({ 
        hasCompletedTour: hasCompleted,
        showTour: !hasCompleted // Show tour if not completed
      });
      
      console.log('Tour initialization complete:', { hasCompleted, showTour: !hasCompleted });
    } catch (error) {
      console.error('Error initializing tour:', error);
      // Default to showing tour if there's an error
      set({ hasCompletedTour: false, showTour: true });
      console.log('Tour initialization fallback: showing tour due to error');
    }
  },

  completeTour: async () => {
    try {
      await AsyncStorage.setItem(TOUR_STORAGE_KEY, 'true');
      set({ 
        hasCompletedTour: true, 
        showTour: false,
        currentTourStep: 0
      });
      console.log('Tour completed and saved');
    } catch (error) {
      console.error('Error saving tour completion:', error);
    }
  },

  resetTour: async () => {
    try {
      await AsyncStorage.removeItem(TOUR_STORAGE_KEY);
      set({ 
        hasCompletedTour: false, 
        showTour: true,
        currentTourStep: 0
      });
      console.log('Tour reset');
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  }
}));