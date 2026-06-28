import type { Dish, MeasuredIngredient, Recipe, UnknownDishClass } from '../types';
import { RECIPES, getRecipeById } from '../data/recipes';
import { compareQuantityToRange } from './ingredientQuantity';

const DUBIOUS_ONLY = ['water', 'flour'];

export interface RecipeMatchResult {
  recipeId?: string;
  recipeName?: string;
  matchScore: number;
  quantityScore: number;
  techniqueScore: number;
  isMatch: boolean;
}

export function matchRecipe(
  ingredients: MeasuredIngredient[],
  techniques: string[],
): RecipeMatchResult {
  let best: RecipeMatchResult = { matchScore: 0, quantityScore: 0, techniqueScore: 0, isMatch: false };

  for (const recipe of RECIPES) {
    const result = scoreRecipeMatch(recipe, ingredients, techniques);
    if (result.matchScore > best.matchScore) best = result;
  }

  best.isMatch = best.matchScore >= 0.75;
  return best;
}

function scoreRecipeMatch(
  recipe: Recipe,
  ingredients: MeasuredIngredient[],
  techniques: string[],
): RecipeMatchResult {
  const ingredientIds = new Set(ingredients.map((i) => i.ingredientId));
  const required = recipe.requiredIngredients;
  let ingredientHits = 0;
  let quantityTotal = 0;

  for (const req of required) {
    if (!ingredientIds.has(req.ingredientId)) continue;
    ingredientHits++;
    const measured = ingredients.find((i) => i.ingredientId === req.ingredientId)!;
    quantityTotal += compareQuantityToRange(measured, req.minAmount, req.maxAmount, req.unit);
  }

  const ingredientScore = required.length ? ingredientHits / required.length : 0;
  const quantityScore = ingredientHits ? quantityTotal / ingredientHits : 0;

  const techSet = new Set(techniques);
  const requiredTech = recipe.requiredTechniques;
  const techniqueHits = requiredTech.filter((t) => techSet.has(t)).length;
  const techniqueScore = requiredTech.length ? techniqueHits / requiredTech.length : 0;

  const matchScore = ingredientScore * 0.5 + quantityScore * 0.25 + techniqueScore * 0.25;

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    matchScore,
    quantityScore,
    techniqueScore,
    isMatch: matchScore >= 0.75,
  };
}

export function classifyUnknownDish(ingredients: MeasuredIngredient[], name: string): UnknownDishClass {
  const ids = ingredients.map((i) => i.ingredientId);
  const safeName = name.trim().toLowerCase();
  const blocked = ['poison', 'garbage', 'trash', 'rotten'];
  if (blocked.some((b) => safeName.includes(b))) return 'inedible';
  if (ingredients.length === 0) return 'inedible';
  if (ingredients.length === 1 && DUBIOUS_ONLY.some((d) => ids[0]?.includes(d))) return 'dubious';

  const hasLeavener = ids.some((id) => id.includes('baking') || id.includes('yeast'));
  const hasFat = ids.some((id) => id.includes('butter') || id.includes('oil'));
  const hasBase = ids.some((id) => id.includes('flour') || id.includes('chocolate'));

  if (!hasBase && !hasFat && !hasLeavener && ingredients.length < 2) return 'inedible';
  if (ingredients.length >= 2 && (hasBase || hasFat)) return 'dubious';
  return 'inedible';
}

export function resolveDishClassification(dish: Dish): UnknownDishClass {
  if (dish.recipeId) return 'known';
  const match = matchRecipe(dish.ingredients, dish.techniques);
  if (match.isMatch && match.recipeId) {
    dish.recipeId = match.recipeId;
    return 'known';
  }
  return classifyUnknownDish(dish.ingredients, dish.name);
}

export function getMatchedRecipeName(dish: Dish): string | undefined {
  if (dish.recipeId) return getRecipeById(dish.recipeId)?.name;
  const match = matchRecipe(dish.ingredients, dish.techniques);
  return match.recipeName;
}
