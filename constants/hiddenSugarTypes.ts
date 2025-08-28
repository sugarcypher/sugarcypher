export interface HiddenSugarType {
  name: string;
  aliases: string[];
  description: string;
  severity: 'low' | 'medium' | 'high';
  commonIn: string[];
}

export const hiddenSugarTypes: HiddenSugarType[] = [
  {
    name: "High-fructose corn syrup",
    aliases: ["HFCS", "glucose-fructose syrup", "corn syrup", "fructose syrup"],
    description: "A highly processed sweetener linked to metabolic issues",
    severity: 'high',
    commonIn: ["sodas", "processed foods", "candy", "baked goods"]
  },
  {
    name: "Agave nectar",
    aliases: ["agave syrup", "agave", "blue agave syrup"],
    description: "Often marketed as healthy but very high in fructose",
    severity: 'high',
    commonIn: ["health foods", "organic products", "beverages"]
  },
  {
    name: "Cane sugar",
    aliases: ["cane juice", "evaporated cane juice", "dehydrated cane juice", "cane crystals"],
    description: "Refined sugar from sugar cane, often disguised with fancy names",
    severity: 'medium',
    commonIn: ["organic foods", "natural products", "beverages"]
  },
  {
    name: "Dextrose",
    aliases: ["glucose", "dextrose monohydrate", "corn sugar"],
    description: "Simple sugar that spikes blood glucose rapidly",
    severity: 'high',
    commonIn: ["sports drinks", "processed foods", "candy"]
  },
  {
    name: "Maltose",
    aliases: ["malt sugar", "maltose syrup"],
    description: "Sugar formed when starch breaks down, high glycemic index",
    severity: 'medium',
    commonIn: ["beer", "malted foods", "cereals"]
  },
  {
    name: "Molasses",
    aliases: ["blackstrap molasses", "treacle", "golden syrup"],
    description: "Concentrated sugar byproduct, still high in sugar content",
    severity: 'medium',
    commonIn: ["baked goods", "sauces", "marinades"]
  },
  {
    name: "Fruit juice concentrate",
    aliases: ["apple juice concentrate", "grape juice concentrate", "fruit concentrate", "concentrated fruit juice"],
    description: "Concentrated fruit sugars, often higher in sugar than whole fruit",
    severity: 'high',
    commonIn: ["fruit snacks", "beverages", "yogurt", "cereals"]
  },
  {
    name: "Brown rice syrup",
    aliases: ["rice syrup", "rice malt", "brown rice malt"],
    description: "High glycemic sweetener that spikes blood sugar",
    severity: 'high',
    commonIn: ["health bars", "organic foods", "gluten-free products"]
  },
  {
    name: "Coconut sugar",
    aliases: ["coconut palm sugar", "palm sugar", "coconut crystals"],
    description: "Still sugar despite natural origin, similar glycemic impact",
    severity: 'medium',
    commonIn: ["health foods", "paleo products", "baked goods"]
  },
  {
    name: "Maltodextrin",
    aliases: ["modified corn starch", "modified food starch"],
    description: "Rapidly absorbed carbohydrate that acts like sugar in the body",
    severity: 'high',
    commonIn: ["protein powders", "processed foods", "artificial sweeteners"]
  }
];

export const sugarConvertingFoods = [
  {
    name: "White bread",
    glycemicIndex: 75,
    sugarEquivalent: 15, // grams of sugar equivalent per 100g
    description: "Rapidly converts to glucose in bloodstream"
  },
  {
    name: "White rice",
    glycemicIndex: 73,
    sugarEquivalent: 12,
    description: "High glycemic carbohydrate that spikes blood sugar"
  },
  {
    name: "Instant oatmeal",
    glycemicIndex: 79,
    sugarEquivalent: 10,
    description: "Processed oats that convert quickly to sugar"
  },
  {
    name: "Cornflakes",
    glycemicIndex: 81,
    sugarEquivalent: 18,
    description: "Highly processed cereal with rapid sugar conversion"
  },
  {
    name: "Potato chips",
    glycemicIndex: 56,
    sugarEquivalent: 8,
    description: "Processed potatoes that convert to sugar"
  }
];

export const findHiddenSugars = (ingredientsList: string): HiddenSugarType[] => {
  if (!ingredientsList) return [];
  
  const foundSugars: HiddenSugarType[] = [];
  const ingredientsLower = ingredientsList.toLowerCase();
  
  hiddenSugarTypes.forEach(sugar => {
    let found = false;
    
    if (ingredientsLower.includes(sugar.name.toLowerCase())) {
      found = true;
    }
    
    if (!found) {
      sugar.aliases.forEach(alias => {
        if (ingredientsLower.includes(alias.toLowerCase())) {
          found = true;
        }
      });
    }
    
    if (found && !foundSugars.find(s => s.name === sugar.name)) {
      foundSugars.push(sugar);
    }
  });
  
  return foundSugars;
};