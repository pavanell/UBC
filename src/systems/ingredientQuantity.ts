import type { MeasuredIngredient } from '../types';
import { getIngredientById } from '../data/ingredients';

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  cup: 240,
  oz: 28.35,
  lb: 453.59,
  each: 50,
};

export function toGrams(amount: number, unit: string, ingredientId: string): number {
  const ingredient = getIngredientById(ingredientId);
  const factor = UNIT_TO_GRAMS[unit.toLowerCase()] ?? 1;
  if (unit === 'ml' || unit === 'l') {
    const density = ingredient?.densityGPerMl ?? 1;
    return amount * factor * density;
  }
  if (unit === 'cup' && ingredient?.densityGPerMl) {
    return amount * 240 * ingredient.densityGPerMl;
  }
  return amount * factor;
}

export function validateIngredientQuantity(
  ingredientId: string,
  amount: number,
  unit: string,
): { valid: boolean; reason?: string } {
  if (amount <= 0) return { valid: false, reason: 'Amount must be greater than zero.' };
  if (amount > 10000) return { valid: false, reason: 'Amount is unrealistically large.' };
  const ingredient = getIngredientById(ingredientId);
  if (!ingredient) return { valid: false, reason: 'Unknown ingredient.' };
  const grams = toGrams(amount, unit, ingredientId);
  if (grams < 0.5) return { valid: false, reason: 'Amount is too small to measure accurately.' };
  return { valid: true };
}

export function compareQuantityToRange(
  measured: MeasuredIngredient,
  minAmount: number,
  maxAmount: number,
  unit: string,
): number {
  const grams = toGrams(measured.amount, measured.unit, measured.ingredientId);
  const minG = toGrams(minAmount, unit, measured.ingredientId);
  const maxG = toGrams(maxAmount, unit, measured.ingredientId);
  if (grams >= minG && grams <= maxG) return 1;
  const mid = (minG + maxG) / 2;
  const diff = Math.abs(grams - mid) / mid;
  return Math.max(0, 1 - diff);
}
