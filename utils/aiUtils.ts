import { Platform } from 'react-native';
import { findHiddenSugars } from '@/constants/hiddenSugarTypes';

interface AIFoodAnalysisResponse {
  name: string;
  sugarEstimate: number;
  ingredients?: string[];
  calories?: number;
  glycemicIndex?: number;
  sugarEquivalent?: number;
}

export const analyzeFoodImage = async (imageUri: string): Promise<AIFoodAnalysisResponse> => {
  try {
    // Convert image to base64 for API
    let base64Image;
    
    // Check if it's a URL or local file
    const isUrl = imageUri.startsWith('http://') || imageUri.startsWith('https://');
    
    if (isUrl || Platform.OS === 'web') {
      // For URLs or web, fetch the image and convert to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(blob);
      });
    } else {
      // For native local files, use expo-file-system to read as base64
      const { readAsStringAsync } = await import('expo-file-system');
      base64Image = await readAsStringAsync(imageUri, { encoding: 'base64' });
    }
    
    // Prepare messages for the AI
    const messages = [
      {
        role: 'system',
        content: `You are a nutrition expert specializing in sugar content analysis and hidden sugar identification. 
        Analyze the food image and provide a detailed assessment focusing on:
        1. Food identification
        2. Sugar content estimation (in grams)
        3. Hidden sugars and high-glycemic ingredients
        4. Glycemic index if applicable
        5. Ingredients that convert to sugar in the body
        
        Pay special attention to processed foods, beverages, and items that may contain hidden sugars.
        For high-glycemic foods (white bread, rice, etc.), estimate their sugar equivalent impact on blood glucose.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this food image. Focus on sugar content, hidden sugars, and ingredients that convert to sugar. Provide detailed nutritional analysis.'
          },
          {
            type: 'image',
            image: base64Image
          }
        ]
      }
    ];
    
    // Make API request
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze food image');
    }
    
    const data = await response.json();
    const aiResponse = data.completion;
    
    // Parse the AI response to extract structured data
    const nameMatch = aiResponse.match(/(?:food|item|dish|meal)(?:\s+is)?(?:\s+a)?(?:\s+appears to be)?(?:\s+looks like)?(?:\s+seems to be)?\s*:?\s*([\w\s\-"]+)(?:\.|$|,)/i);
    const sugarMatch = aiResponse.match(/(?:sugar content|sugar amount|sugar)(?:\s+is)?(?:\s+approximately)?(?:\s+about)?(?:\s+around)?(?:\s+estimated at)?\s*:?\s*(\d+(?:\.\d+)?)\s*(?:g|grams)/i);
    const caloriesMatch = aiResponse.match(/(?:calories|caloric content)(?:\s+is)?(?:\s+approximately)?(?:\s+about)?(?:\s+around)?(?:\s+estimated at)?\s*:?\s*(\d+(?:\.\d+)?)/i);
    const glycemicMatch = aiResponse.match(/(?:glycemic index|GI)(?:\s+is)?(?:\s+approximately)?(?:\s+about)?(?:\s+around)?\s*:?\s*(\d+)/i);
    const sugarEquivalentMatch = aiResponse.match(/(?:sugar equivalent|converts to|blood sugar impact)(?:\s+is)?(?:\s+approximately)?(?:\s+about)?(?:\s+around)?\s*:?\s*(\d+(?:\.\d+)?)\s*(?:g|grams)/i);
    
    // Extract ingredients if mentioned
    const ingredientsSection = aiResponse.match(/(?:ingredients|contains|made with|composition)(?:\s+include)?(?:\s+may include)?(?:\s+likely include)?(?:\s+probably include)?(?:\s*:)?\s*([\w\s,."()-]+)(?:\.|$)/i);
    let ingredients: string[] = [];
    
    if (ingredientsSection && ingredientsSection[1]) {
      ingredients = ingredientsSection[1]
        .split(/,|\n/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    return {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown Food',
      sugarEstimate: sugarMatch ? parseFloat(sugarMatch[1]) : 0,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      calories: caloriesMatch ? parseInt(caloriesMatch[1]) : undefined,
      glycemicIndex: glycemicMatch ? parseInt(glycemicMatch[1]) : undefined,
      sugarEquivalent: sugarEquivalentMatch ? parseFloat(sugarEquivalentMatch[1]) : undefined
    };
  } catch (error) {
    console.error('Error analyzing food image:', error);
    return {
      name: 'Unknown Food',
      sugarEstimate: 0
    };
  }
};

import { resolveFoodData } from './foodDataResolver';

export const searchFoodByBarcode = async (barcode: string): Promise<any> => {
  console.log(`[aiUtils] Searching for barcode: ${barcode}`);
  
  try {
    // Use the FoodDataResolver for consistent barcode lookup
    const result = await resolveFoodData(barcode);
    
    if (result.success && result.foodData) {
      // Convert to the legacy format expected by existing code
      const legacyFormat = {
        name: result.foodData.product_name,
        brand: result.foodData.brand,
        sugarPerServing: result.foodData.nutrition_facts.sugars_g,
        ingredients: result.foodData.ingredients.join(', '),
        source: result.source,
        trust_score: result.trust_score
      };
      
      console.log(`[aiUtils] Found product via ${result.source}:`, legacyFormat);
      return legacyFormat;
    } else {
      console.log(`[aiUtils] Failed to resolve barcode: ${result.error}`);
      
      // Fallback to generating a random product for demo purposes
      const productNames = ['Mystery Snack', 'Unknown Beverage', 'Test Food Item', 'Sample Product', 'Demo Snack'];
      const brands = ['Generic', 'Test Brand', 'Demo Co.', 'Sample Inc.', 'Unknown Brand'];
      const sugarLevels = [5, 12, 18, 25, 32, 38, 45];
      
      const randomName = productNames[Math.floor(Math.random() * productNames.length)];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      const randomSugar = sugarLevels[Math.floor(Math.random() * sugarLevels.length)];
      
      const fallbackProduct = {
        name: randomName,
        brand: randomBrand,
        sugarPerServing: randomSugar,
        ingredients: 'Various ingredients including sugar, artificial flavors, and preservatives',
        source: 'Generated Fallback',
        trust_score: 0.3
      };
      
      console.log('[aiUtils] Generated fallback product:', fallbackProduct);
      return fallbackProduct;
    }
  } catch (error) {
    console.error('[aiUtils] Error in searchFoodByBarcode:', error);
    
    // Return a basic fallback product
    return {
      name: 'Unknown Product',
      brand: 'Unknown Brand',
      sugarPerServing: 15,
      ingredients: 'Unable to determine ingredients',
      source: 'Error Fallback',
      trust_score: 0.1
    };
  }
};