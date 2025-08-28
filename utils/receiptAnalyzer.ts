import { Platform } from 'react-native';

export interface ReceiptAnalysisResult {
  store: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  sugarScore: number;
  warnings: string[];
}

export interface ReceiptItem {
  name: string;
  price: number;
  sugarContent: number;
  category: string;
  isHighSugar: boolean;
  hasHiddenSugars: boolean;
  warnings: string[];
}

export const analyzeReceiptImage = async (imageUri: string): Promise<ReceiptAnalysisResult> => {
  try {
    console.log('[ReceiptAnalyzer] Analyzing receipt image:', imageUri);
    
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
        content: `You are a nutrition expert specializing in receipt analysis and sugar content evaluation. 
        Analyze the receipt image and provide a detailed assessment focusing on:
        1. Store name and date
        2. Individual items with estimated sugar content
        3. Item categorization (produce, beverages, snacks, etc.)
        4. Hidden sugar identification in processed foods
        5. Overall sugar shopping score (0-100, higher is better)
        6. Warnings for high-sugar items
        
        Pay special attention to processed foods, beverages, and packaged items that may contain hidden sugars.
        Provide a comprehensive analysis that helps users understand their sugar shopping habits.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this receipt image. Focus on identifying items, their sugar content, and provide a sugar shopping score. Include warnings for high-sugar items and hidden sugars.'
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
      throw new Error('Failed to analyze receipt image');
    }
    
    const data = await response.json();
    const aiResponse = data.completion;
    
    console.log('[ReceiptAnalyzer] AI Response:', aiResponse);
    
    // Parse the AI response to extract structured data
    const result = parseReceiptAnalysis(aiResponse);
    
    return result;
  } catch (error) {
    console.error('[ReceiptAnalyzer] Error analyzing receipt:', error);
    
    // Return a fallback result
    return {
      store: 'Unknown Store',
      date: new Date().toLocaleDateString(),
      total: 0,
      items: [],
      sugarScore: 50,
      warnings: ['Unable to analyze receipt image']
    };
  }
};

const parseReceiptAnalysis = (aiResponse: string): ReceiptAnalysisResult => {
  // Extract store name
  const storeMatch = aiResponse.match(/(?:store|shop|market)(?:\s+name)?(?:\s+is)?(?:\s*:)?\s*([^\n\r.]+)/i);
  const store = storeMatch ? storeMatch[1].trim() : 'Unknown Store';
  
  // Extract date
  const dateMatch = aiResponse.match(/(?:date|purchased on|transaction date)(?:\s*:)?\s*([^\n\r.]+)/i);
  const date = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString();
  
  // Extract total
  const totalMatch = aiResponse.match(/(?:total|amount|cost)(?:\s*:)?\s*\$?(\d+(?:\.\d{2})?)/i);
  const total = totalMatch ? parseFloat(totalMatch[1]) : 0;
  
  // Extract sugar score
  const scoreMatch = aiResponse.match(/(?:sugar score|score|rating)(?:\s*:)?\s*(\d+)(?:\/100)?/i);
  const sugarScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
  
  // Extract items (this is a simplified parser - in reality, you'd want more sophisticated parsing)
  const items: ReceiptItem[] = [];
  const itemsSection = aiResponse.match(/(?:items|products|purchases)(?:\s*:)?\s*([\s\S]*?)(?:\n\n|$)/i);
  
  if (itemsSection && itemsSection[1]) {
    const itemLines = itemsSection[1].split('\n').filter(line => line.trim().length > 0);
    
    itemLines.forEach(line => {
      // Simple parsing - look for patterns like "Item Name - $X.XX - Xg sugar"
      const itemMatch = line.match(/(.+?)\s*-\s*\$?(\d+(?:\.\d{2})?)\s*-\s*(\d+)g?\s*sugar/i);
      
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        const sugarContent = parseInt(itemMatch[3]);
        
        items.push({
          name,
          price,
          sugarContent,
          category: categorizeItem(name),
          isHighSugar: sugarContent > 15,
          hasHiddenSugars: hasHiddenSugarsInName(name),
          warnings: generateItemWarnings(name, sugarContent)
        });
      }
    });
  }
  
  // Extract warnings
  const warnings: string[] = [];
  const warningsMatch = aiResponse.match(/(?:warnings|concerns|alerts)(?:\s*:)?\s*([\s\S]*?)(?:\n\n|$)/i);
  
  if (warningsMatch && warningsMatch[1]) {
    const warningLines = warningsMatch[1].split('\n').filter(line => line.trim().length > 0);
    warnings.push(...warningLines.map(line => line.trim()));
  }
  
  return {
    store,
    date,
    total,
    items,
    sugarScore,
    warnings
  };
};

const categorizeItem = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('vegetable') || name.includes('lettuce') || name.includes('carrot')) {
    return 'Produce';
  }
  
  if (name.includes('soda') || name.includes('juice') || name.includes('drink') || 
      name.includes('cola') || name.includes('beverage')) {
    return 'Beverages';
  }
  
  if (name.includes('bread') || name.includes('bagel') || name.includes('muffin') || 
      name.includes('cake') || name.includes('cookie')) {
    return 'Bakery';
  }
  
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
      name.includes('butter')) {
    return 'Dairy';
  }
  
  if (name.includes('chicken') || name.includes('beef') || name.includes('fish') || 
      name.includes('meat') || name.includes('turkey')) {
    return 'Meat';
  }
  
  if (name.includes('chips') || name.includes('candy') || name.includes('chocolate') || 
      name.includes('snack') || name.includes('cookie')) {
    return 'Snacks';
  }
  
  return 'Other';
};

const hasHiddenSugarsInName = (itemName: string): boolean => {
  const name = itemName.toLowerCase();
  const hiddenSugarItems = [
    'sauce', 'dressing', 'bread', 'yogurt', 'cereal', 'granola', 
    'protein bar', 'energy bar', 'crackers', 'soup', 'pasta sauce'
  ];
  
  return hiddenSugarItems.some(item => name.includes(item));
};

const generateItemWarnings = (itemName: string, sugarContent: number): string[] => {
  const warnings: string[] = [];
  
  if (sugarContent > 25) {
    warnings.push('Very high sugar content');
  } else if (sugarContent > 15) {
    warnings.push('High sugar content');
  }
  
  if (hasHiddenSugarsInName(itemName)) {
    warnings.push('May contain hidden sugars');
  }
  
  const name = itemName.toLowerCase();
  if (name.includes('diet') || name.includes('sugar-free')) {
    warnings.push('Contains artificial sweeteners');
  }
  
  return warnings;
};