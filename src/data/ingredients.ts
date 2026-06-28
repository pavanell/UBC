import type { Ingredient } from '../types';

export const INGREDIENTS: Ingredient[] = [
  { id: 'all_purpose_flour', name: 'All-Purpose Flour', category: 'flour', defaultUnit: 'cup', densityGPerMl: 0.53 },
  { id: 'bread_flour', name: 'Bread Flour', category: 'flour', defaultUnit: 'cup', densityGPerMl: 0.55 },
  { id: 'cake_flour', name: 'Cake Flour', category: 'flour', defaultUnit: 'cup', densityGPerMl: 0.48 },
  { id: 'whole_wheat_flour', name: 'Whole Wheat Flour', category: 'flour', defaultUnit: 'cup', densityGPerMl: 0.52 },
  { id: 'granulated_sugar', name: 'Granulated Sugar', category: 'sugar', defaultUnit: 'cup', densityGPerMl: 0.85 },
  { id: 'brown_sugar', name: 'Brown Sugar', category: 'sugar', defaultUnit: 'cup', densityGPerMl: 0.93 },
  { id: 'powdered_sugar', name: 'Powdered Sugar', category: 'sugar', defaultUnit: 'cup', densityGPerMl: 0.56 },
  { id: 'honey', name: 'Honey', category: 'sugar', defaultUnit: 'tbsp', densityGPerMl: 1.42 },
  { id: 'maple_syrup', name: 'Maple Syrup', category: 'sugar', defaultUnit: 'tbsp', densityGPerMl: 1.33 },
  { id: 'butter', name: 'Butter', category: 'fat', defaultUnit: 'tbsp', densityGPerMl: 0.91 },
  { id: 'vegetable_oil', name: 'Vegetable Oil', category: 'fat', defaultUnit: 'tbsp', densityGPerMl: 0.92 },
  { id: 'shortening', name: 'Shortening', category: 'fat', defaultUnit: 'tbsp', densityGPerMl: 0.91 },
  { id: 'coconut_oil', name: 'Coconut Oil', category: 'fat', defaultUnit: 'tbsp', densityGPerMl: 0.92 },
  { id: 'milk', name: 'Milk', category: 'dairy', defaultUnit: 'cup', densityGPerMl: 1.03 },
  { id: 'heavy_cream', name: 'Heavy Cream', category: 'dairy', defaultUnit: 'cup', densityGPerMl: 0.99 },
  { id: 'buttermilk', name: 'Buttermilk', category: 'dairy', defaultUnit: 'cup', densityGPerMl: 1.03 },
  { id: 'cream_cheese', name: 'Cream Cheese', category: 'dairy', defaultUnit: 'oz', densityGPerMl: 1.04 },
  { id: 'sour_cream', name: 'Sour Cream', category: 'dairy', defaultUnit: 'cup', densityGPerMl: 1.01 },
  { id: 'egg', name: 'Egg', category: 'egg', defaultUnit: 'each' },
  { id: 'egg_white', name: 'Egg White', category: 'egg', defaultUnit: 'each' },
  { id: 'egg_yolk', name: 'Egg Yolk', category: 'egg', defaultUnit: 'each' },
  { id: 'dark_chocolate', name: 'Dark Chocolate', category: 'chocolate', defaultUnit: 'oz' },
  { id: 'milk_chocolate', name: 'Milk Chocolate', category: 'chocolate', defaultUnit: 'oz' },
  { id: 'white_chocolate', name: 'White Chocolate', category: 'chocolate', defaultUnit: 'oz' },
  { id: 'cocoa_powder', name: 'Cocoa Powder', category: 'chocolate', defaultUnit: 'tbsp', densityGPerMl: 0.52 },
  { id: 'chocolate_chips', name: 'Chocolate Chips', category: 'chocolate', defaultUnit: 'cup' },
  { id: 'strawberry', name: 'Strawberry', category: 'fruit', defaultUnit: 'cup' },
  { id: 'blueberry', name: 'Blueberry', category: 'fruit', defaultUnit: 'cup' },
  { id: 'raspberry', name: 'Raspberry', category: 'fruit', defaultUnit: 'cup' },
  { id: 'apple', name: 'Apple', category: 'fruit', defaultUnit: 'cup' },
  { id: 'banana', name: 'Banana', category: 'fruit', defaultUnit: 'each' },
  { id: 'lemon', name: 'Lemon', category: 'fruit', defaultUnit: 'each' },
  { id: 'orange', name: 'Orange', category: 'fruit', defaultUnit: 'each' },
  { id: 'carrot', name: 'Carrot', category: 'vegetable', defaultUnit: 'cup' },
  { id: 'pumpkin', name: 'Pumpkin Puree', category: 'vegetable', defaultUnit: 'cup' },
  { id: 'zucchini', name: 'Zucchini', category: 'vegetable', defaultUnit: 'cup' },
  { id: 'sweet_potato', name: 'Sweet Potato', category: 'vegetable', defaultUnit: 'cup' },
  { id: 'walnut', name: 'Walnut', category: 'nut', defaultUnit: 'cup' },
  { id: 'pecan', name: 'Pecan', category: 'nut', defaultUnit: 'cup' },
  { id: 'almond', name: 'Almond', category: 'nut', defaultUnit: 'cup' },
  { id: 'peanut_butter', name: 'Peanut Butter', category: 'nut', defaultUnit: 'cup', densityGPerMl: 1.08 },
  { id: 'cinnamon', name: 'Cinnamon', category: 'spice', defaultUnit: 'tsp' },
  { id: 'nutmeg', name: 'Nutmeg', category: 'spice', defaultUnit: 'tsp' },
  { id: 'ginger', name: 'Ground Ginger', category: 'spice', defaultUnit: 'tsp' },
  { id: 'vanilla_extract', name: 'Vanilla Extract', category: 'extract', defaultUnit: 'tsp' },
  { id: 'almond_extract', name: 'Almond Extract', category: 'extract', defaultUnit: 'tsp' },
  { id: 'peppermint_extract', name: 'Peppermint Extract', category: 'extract', defaultUnit: 'tsp' },
  { id: 'baking_powder', name: 'Baking Powder', category: 'leavener', defaultUnit: 'tsp' },
  { id: 'baking_soda', name: 'Baking Soda', category: 'leavener', defaultUnit: 'tsp' },
  { id: 'yeast', name: 'Active Dry Yeast', category: 'leavener', defaultUnit: 'tsp' },
  { id: 'cornstarch', name: 'Cornstarch', category: 'starch', defaultUnit: 'tbsp' },
  { id: 'oats', name: 'Rolled Oats', category: 'grain', defaultUnit: 'cup' },
  { id: 'rice_flour', name: 'Rice Flour', category: 'grain', defaultUnit: 'cup' },
  { id: 'jam', name: 'Fruit Jam', category: 'filling', defaultUnit: 'cup' },
  { id: 'custard', name: 'Pastry Custard', category: 'filling', defaultUnit: 'cup' },
  { id: 'cream_filling', name: 'Whipped Cream Filling', category: 'filling', defaultUnit: 'cup' },
  { id: 'sprinkles', name: 'Sprinkles', category: 'decoration', defaultUnit: 'tbsp' },
  { id: 'fondant', name: 'Fondant', category: 'decoration', defaultUnit: 'oz' },
  { id: 'edible_flowers', name: 'Edible Flowers', category: 'decoration', defaultUnit: 'each' },
  { id: 'cream_cheese_frosting', name: 'Cream Cheese Frosting', category: 'decoration', defaultUnit: 'cup' },
  { id: 'buttercream', name: 'Buttercream', category: 'decoration', defaultUnit: 'cup' },
  { id: 'cheddar', name: 'Cheddar Cheese', category: 'cheese', defaultUnit: 'cup' },
  { id: 'parmesan', name: 'Parmesan', category: 'cheese', defaultUnit: 'cup' },
  { id: 'spinach', name: 'Spinach', category: 'savory', defaultUnit: 'cup' },
  { id: 'tomato', name: 'Tomato', category: 'savory', defaultUnit: 'cup' },
  { id: 'olive', name: 'Olives', category: 'savory', defaultUnit: 'cup' },
  { id: 'salt', name: 'Salt', category: 'spice', defaultUnit: 'tsp' },
  { id: 'water', name: 'Water', category: 'other', defaultUnit: 'cup', densityGPerMl: 1 },
];

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find((i) => i.id === id);
}

export function searchIngredients(query: string, category?: string): Ingredient[] {
  const q = query.trim().toLowerCase();
  return INGREDIENTS.filter((i) => {
    if (category && i.category !== category) return false;
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || i.category.includes(q);
  });
}

export const INGREDIENT_CATEGORIES = [
  'flour', 'sugar', 'fat', 'dairy', 'egg', 'chocolate', 'fruit', 'vegetable',
  'nut', 'spice', 'extract', 'leavener', 'starch', 'grain', 'filling',
  'decoration', 'cheese', 'savory', 'other',
] as const;
