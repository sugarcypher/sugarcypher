import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReceiptItem {
  name: string;
  price: number;
  sugarContent: number;
  category: string;
  isHighSugar: boolean;
  hasHiddenSugars: boolean;
  warnings: string[];
}

export interface Receipt {
  id: string;
  store: string;
  date: string;
  total: number;
  totalItems: number;
  highSugarItems: number;
  sugarScore: number;
  items: ReceiptItem[];
  warnings: string[];
}

interface ShoppingStoreState {
  receipts: Receipt[];
  currentScore: number;
  weeklyAverage: number;
  monthlyTrend: number[];
  isLoading: boolean;
  addReceipt: (receipt: Receipt) => void;
  updateScore: (score: number) => void;
  getReceiptById: (id: string) => Receipt | undefined;
  calculateWeeklyAverage: () => number;
}

const STORAGE_KEY = 'shopping_receipts';

export const [ShoppingStoreProvider, useShoppingStore] = createContextHook<ShoppingStoreState>(() => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(75);
  const [weeklyAverage, setWeeklyAverage] = useState<number>(72);
  const [monthlyTrend, setMonthlyTrend] = useState<number[]>([65, 68, 72, 75]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load receipts from storage on mount
  useEffect(() => {
    loadReceipts();
  }, []);

  // Update weekly average when receipts change
  useEffect(() => {
    if (receipts.length > 0) {
      const average = calculateWeeklyAverage();
      setWeeklyAverage(average);
    }
  }, [receipts]);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedReceipts = JSON.parse(stored);
        setReceipts(parsedReceipts);
        
        // Set current score to the most recent receipt's score
        if (parsedReceipts.length > 0) {
          setCurrentScore(parsedReceipts[0].sugarScore);
        }
      }
    } catch (error) {
      console.error('[ShoppingStore] Error loading receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReceipts = async (newReceipts: Receipt[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReceipts));
    } catch (error) {
      console.error('[ShoppingStore] Error saving receipts:', error);
    }
  };

  const addReceipt = (receipt: Receipt) => {
    console.log('[ShoppingStore] Adding receipt:', receipt);
    
    const updatedReceipts = [receipt, ...receipts].slice(0, 50); // Keep only last 50 receipts
    setReceipts(updatedReceipts);
    setCurrentScore(receipt.sugarScore);
    saveReceipts(updatedReceipts);
  };

  const updateScore = (score: number) => {
    setCurrentScore(score);
  };

  const getReceiptById = (id: string): Receipt | undefined => {
    return receipts.find(receipt => receipt.id === id);
  };

  const calculateWeeklyAverage = (): number => {
    if (receipts.length === 0) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate >= oneWeekAgo;
    });
    
    if (recentReceipts.length === 0) return currentScore;
    
    const totalScore = recentReceipts.reduce((sum, receipt) => sum + receipt.sugarScore, 0);
    return Math.round(totalScore / recentReceipts.length);
  };

  return {
    receipts,
    currentScore,
    weeklyAverage,
    monthlyTrend,
    isLoading,
    addReceipt,
    updateScore,
    getReceiptById,
    calculateWeeklyAverage,
  };
});