import { HiddenSugar } from '@/types/food';

export const hiddenSugars: HiddenSugar[] = [
  {
    name: "High-fructose corn syrup",
    aliases: ["HFCS", "glucose-fructose syrup"],
    description: "A sweetener made from corn starch that has been processed to convert some of its glucose into fructose."
  },
  {
    name: "Agave nectar",
    aliases: ["agave syrup"],
    description: "A sweetener commercially produced from several species of agave plants."
  },
  {
    name: "Cane sugar",
    aliases: ["cane juice", "evaporated cane juice"],
    description: "Sugar derived from sugar cane."
  },
  {
    name: "Dextrose",
    aliases: ["glucose"],
    description: "A simple sugar made from corn that is chemically identical to glucose."
  },
  {
    name: "Maltose",
    aliases: ["malt sugar"],
    description: "A sugar formed when starch breaks down."
  },
  {
    name: "Molasses",
    aliases: ["blackstrap molasses", "treacle"],
    description: "A thick, dark syrup that is a byproduct of sugar refining."
  },
  {
    name: "Sucrose",
    aliases: ["table sugar", "granulated sugar"],
    description: "Common table sugar that consists of glucose and fructose."
  },
  {
    name: "Fruit juice concentrate",
    aliases: ["apple juice concentrate", "grape juice concentrate"],
    description: "Fruit juice with most of the water removed, used as a sweetener."
  },
  {
    name: "Honey",
    aliases: ["raw honey", "pure honey"],
    description: "A sweet, viscous food substance made by honey bees."
  },
  {
    name: "Maple syrup",
    aliases: ["maple sugar"],
    description: "A syrup made from the sap of sugar maple trees."
  },
  {
    name: "Coconut sugar",
    aliases: ["coconut palm sugar"],
    description: "A natural sugar made from sap of the coconut palm."
  },
  {
    name: "Brown rice syrup",
    aliases: ["rice syrup", "rice malt"],
    description: "A sweetener made by exposing cooked rice to enzymes."
  }
];

export const findHiddenSugars = (ingredientsList: string): string[] => {
  if (!ingredientsList) return [];
  
  const foundSugars: string[] = [];
  const ingredientsLower = ingredientsList.toLowerCase();
  
  hiddenSugars.forEach(sugar => {
    if (ingredientsLower.includes(sugar.name.toLowerCase())) {
      foundSugars.push(sugar.name);
    }
    
    sugar.aliases.forEach(alias => {
      if (ingredientsLower.includes(alias.toLowerCase()) && !foundSugars.includes(sugar.name)) {
        foundSugars.push(sugar.name);
      }
    });
  });
  
  return foundSugars;
};