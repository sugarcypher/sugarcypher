import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { trpcClient } from '@/lib/trpc';

interface MetaSweetConfig {
  module: string;
  version: string;
  instruction: string;
  input_pipeline: {
    scan_priority: string[];
    required_outputs: string[];
    fallback_behavior: string;
  };
  user_context_overlay: {
    enabled: boolean;
    parameters: {
      insulin_sensitivity: 'low' | 'normal' | 'high' | 'variable';
      dietary_mode: 'standard' | 'keto' | 'diabetic' | 'adaptive';
      meal_buffering: {
        paired_protein_g?: number;
        paired_fat_g?: number;
      };
      activity_state?: 'resting' | 'pre-exercise' | 'post-exercise';
      microbiome_profile?: string;
    };
    modifier_logic: string;
  };
  core_logic: {
    compute: {
      net_carbs: string;
      glycemic_load: string;
      sugar_equivalent_g: string;
      delta_vs_label: string;
    };
    glycemic_index_resolution: string;
  };
  output: {
    tts_response: string;
    text_overlay: string;
    alerts: string[];
    branding: {
      label: string;
      badge_display: boolean;
    };
  };
}

interface FoodData {
  ingredients: string[];
  nutrition_label: {
    total_carbs: number;
    fiber: number;
    sugar: number;
    protein?: number;
    fat?: number;
  };
  serving_size_g: number;
  product_name: string;
  brand: string;
  glycemic_index?: number;
}

interface MetaSweetResult {
  sugar_equivalent_g: number;
  glycemic_load: number;
  net_carbs: number;
  delta_vs_label: number;
  tts_response: string;
  text_overlay: string;
  alerts: string[];
  confidence_score: number;
}

interface MetaSweetProcessorProps {
  foodData: FoodData;
  userContext?: Partial<MetaSweetConfig['user_context_overlay']['parameters']>;
  onResult: (result: MetaSweetResult) => void;
  onError: (error: string) => void;
}

const DEFAULT_CONFIG: MetaSweetConfig = {
  module: "MetaSweet™",
  version: "1.0.0",
  instruction: "Upon scan trigger (barcode, OCR, voice, or manual), resolve all nutrition and ingredient data, estimate glycemic impact, and express it in metabolically equivalent sugar grams using user-contextual logic.",
  input_pipeline: {
    scan_priority: ["barcode", "ocr", "voice", "manual"],
    required_outputs: ["ingredients", "nutrition_label", "serving_size_g", "product_name", "brand"],
    fallback_behavior: "If barcode resolution fails, extract text from package via OCR; if OCR fails, process voice or manual input. Always attempt full nutrition and ingredient resolution before MetaSweet™ processing."
  },
  user_context_overlay: {
    enabled: true,
    parameters: {
      insulin_sensitivity: "variable",
      dietary_mode: "adaptive",
      meal_buffering: {
        paired_protein_g: undefined,
        paired_fat_g: undefined
      },
      activity_state: "resting",
      microbiome_profile: undefined
    },
    modifier_logic: "Adjust final glycemic load using a weighted sum of contextual buffers; reduce effective sugar impact if metabolic conditions indicate."
  },
  core_logic: {
    compute: {
      net_carbs: "total_carbs - fiber",
      glycemic_load: "(GI × net_carbs) ÷ 100",
      sugar_equivalent_g: "glycemic_load",
      delta_vs_label: "sugar_equivalent_g - label_sugar"
    },
    glycemic_index_resolution: "Fetch known GI from internal table or estimate via ingredient NLP if unknown."
  },
  output: {
    tts_response: "This food acts like {{sugar_equivalent_g}} grams of sugar in your body.",
    text_overlay: "Sugar Impact (MetaSweet™): {{sugar_equivalent_g}}g",
    alerts: [
      "if delta_vs_label > 10: show 'Hidden Sugar Alert'",
      "if glycemic_load > 20: show 'High GL Warning'"
    ],
    branding: {
      label: "Powered by MetaSweet™",
      badge_display: true
    }
  }
};

// Glycemic Index database (simplified)
const GLYCEMIC_INDEX_DB: Record<string, number> = {
  // Grains & Cereals
  'white_bread': 75,
  'whole_wheat_bread': 74,
  'white_rice': 73,
  'brown_rice': 68,
  'oats': 55,
  'quinoa': 53,
  
  // Fruits
  'watermelon': 72,
  'pineapple': 59,
  'banana': 51,
  'apple': 36,
  'orange': 43,
  'grapes': 46,
  
  // Vegetables
  'potato': 87,
  'sweet_potato': 70,
  'carrot': 47,
  'corn': 52,
  
  // Sugars
  'glucose': 100,
  'sucrose': 65,
  'fructose': 15,
  'honey': 61,
  'maple_syrup': 54,
  
  // Dairy
  'milk': 39,
  'yogurt': 41,
  
  // Legumes
  'lentils': 32,
  'chickpeas': 28,
  'kidney_beans': 24,
  
  // Default for unknown foods
  'unknown': 55
};

export const MetaSweetProcessor: React.FC<MetaSweetProcessorProps> = ({
  foodData,
  userContext = {},
  onResult,
  onError
}) => {
  const [processing, setProcessing] = useState(false);
  const [config] = useState<MetaSweetConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (foodData) {
      processFood();
    }
  }, [foodData]);

  const estimateGlycemicIndex = (ingredients: string[], productName: string): number => {
    const searchTerms = [...ingredients, productName].join(' ').toLowerCase();
    
    // Check for direct matches
    for (const [food, gi] of Object.entries(GLYCEMIC_INDEX_DB)) {
      if (searchTerms.includes(food.replace('_', ' '))) {
        return gi;
      }
    }
    
    // Estimate based on food category
    if (searchTerms.includes('bread') || searchTerms.includes('white')) return 75;
    if (searchTerms.includes('whole') && searchTerms.includes('grain')) return 55;
    if (searchTerms.includes('fruit') || searchTerms.includes('juice')) return 50;
    if (searchTerms.includes('vegetable')) return 45;
    if (searchTerms.includes('sugar') || searchTerms.includes('candy')) return 80;
    if (searchTerms.includes('protein') || searchTerms.includes('meat')) return 0;
    
    return GLYCEMIC_INDEX_DB.unknown;
  };

  const applyUserContextModifiers = (
    baseGlycemicLoad: number,
    context: Partial<MetaSweetConfig['user_context_overlay']['parameters']>
  ): number => {
    let modifiedGL = baseGlycemicLoad;
    
    // Insulin sensitivity adjustment
    switch (context.insulin_sensitivity) {
      case 'low':
        modifiedGL *= 1.3; // Higher impact for insulin resistant individuals
        break;
      case 'high':
        modifiedGL *= 0.7; // Lower impact for highly insulin sensitive
        break;
      case 'normal':
        modifiedGL *= 1.0;
        break;
      default: // variable
        modifiedGL *= 1.0;
    }
    
    // Dietary mode adjustment
    switch (context.dietary_mode) {
      case 'keto':
        modifiedGL *= 1.5; // Higher sensitivity to carbs on keto
        break;
      case 'diabetic':
        modifiedGL *= 1.2; // More conservative estimates
        break;
      case 'standard':
      case 'adaptive':
      default:
        modifiedGL *= 1.0;
    }
    
    // Meal buffering (protein and fat slow absorption)
    const proteinBuffer = context.meal_buffering?.paired_protein_g || 0;
    const fatBuffer = context.meal_buffering?.paired_fat_g || 0;
    
    if (proteinBuffer > 10) modifiedGL *= 0.85; // Protein slows absorption
    if (fatBuffer > 10) modifiedGL *= 0.8; // Fat slows absorption even more
    
    // Activity state
    switch (context.activity_state) {
      case 'pre-exercise':
        modifiedGL *= 0.7; // Exercise will use glucose
        break;
      case 'post-exercise':
        modifiedGL *= 0.6; // Muscles are glucose hungry
        break;
      case 'resting':
      default:
        modifiedGL *= 1.0;
    }
    
    return Math.max(0, modifiedGL);
  };

  const processFood = async () => {
    try {
      setProcessing(true);
      
      // Record evidence of food analysis
      try {
        await trpcClient.security.evidence.record.mutate({
          eventType: 'user_action',
          action: 'food_analysis_metasweet',
          metadata: {
            product_name: foodData.product_name,
            brand: foodData.brand,
            analysis_type: 'glycemic_impact',
            user_context_applied: Object.keys(userContext).length > 0
          }
        });
      } catch (evidenceError) {
        console.warn('Failed to record evidence:', evidenceError);
      }
      
      // Step 1: Calculate net carbs
      const netCarbs = foodData.nutrition_label.total_carbs - (foodData.nutrition_label.fiber || 0);
      
      // Step 2: Estimate or retrieve glycemic index
      const glycemicIndex = foodData.glycemic_index || 
        estimateGlycemicIndex(foodData.ingredients, foodData.product_name);
      
      // Step 3: Calculate base glycemic load
      const baseGlycemicLoad = (glycemicIndex * netCarbs) / 100;
      
      // Step 4: Apply user context modifiers
      const contextualGlycemicLoad = config.user_context_overlay.enabled
        ? applyUserContextModifiers(baseGlycemicLoad, userContext)
        : baseGlycemicLoad;
      
      // Step 5: Convert to sugar equivalent
      const sugarEquivalentG = Math.round(contextualGlycemicLoad * 10) / 10;
      
      // Step 6: Calculate delta vs label
      const deltaVsLabel = sugarEquivalentG - foodData.nutrition_label.sugar;
      
      // Step 7: Generate alerts
      const alerts: string[] = [];
      if (deltaVsLabel > 10) {
        alerts.push('Hidden Sugar Alert: This food has a much higher sugar impact than the label suggests!');
      }
      if (contextualGlycemicLoad > 20) {
        alerts.push('High GL Warning: This food will cause a significant blood sugar spike.');
      }
      if (glycemicIndex > 70) {
        alerts.push('High GI Alert: This food is rapidly absorbed and may cause quick energy spikes.');
      }
      
      // Step 8: Generate responses
      const ttsResponse = config.output.tts_response.replace('{{sugar_equivalent_g}}', sugarEquivalentG.toString());
      const textOverlay = config.output.text_overlay.replace('{{sugar_equivalent_g}}', sugarEquivalentG.toString());
      
      // Step 9: Calculate confidence score
      let confidenceScore = 0.8; // Base confidence
      if (foodData.glycemic_index) confidenceScore += 0.15; // Known GI increases confidence
      if (foodData.ingredients.length > 3) confidenceScore += 0.05; // More ingredients = better analysis
      confidenceScore = Math.min(1.0, confidenceScore);
      
      const result: MetaSweetResult = {
        sugar_equivalent_g: sugarEquivalentG,
        glycemic_load: contextualGlycemicLoad,
        net_carbs: netCarbs,
        delta_vs_label: deltaVsLabel,
        tts_response: ttsResponse,
        text_overlay: textOverlay,
        alerts,
        confidence_score: confidenceScore
      };
      
      onResult(result);
      
    } catch (error) {
      console.error('MetaSweet processing error:', error);
      onError(`Failed to process food data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00ff88" />
        <Text style={styles.processingText}>Analyzing with MetaSweet™...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
    marginVertical: 4
  },
  processingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '500'
  }
});

export default MetaSweetProcessor;