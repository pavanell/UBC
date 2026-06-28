import { describe, expect, it } from 'vitest';
import { validateHardModeIngredients, scoreDish } from '../src/systems/judging';
import { createEmptyDish } from '../src/systems/proceduralDish';
import type { Challenge } from '../src/types';

const baseChallenge: Challenge = {
  id: 'test',
  round: 1,
  theme: 'Test',
  description: 'Test',
  difficulty: 1,
  multiComponent: false,
  requiredIngredients: ['apple', 'cinnamon', 'butter'],
};

describe('judging', () => {
  it('scores dish with whole numbers only', () => {
    const dish = createEmptyDish('Test Cake');
    dish.ingredients = [
      { ingredientId: 'all_purpose_flour', amount: 2, unit: 'cup' },
      { ingredientId: 'granulated_sugar', amount: 1, unit: 'cup' },
    ];
    dish.techniques = ['stir', 'bake'];
    const score = scoreDish(dish, baseChallenge, 3);
    expect(Number.isInteger(score.taste)).toBe(true);
    expect(Number.isInteger(score.presentation)).toBe(true);
    expect(Number.isInteger(score.creativity)).toBe(true);
    expect(Number.isInteger(score.total)).toBe(true);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it('validates hard mode required ingredients', () => {
    const dish = createEmptyDish('Hard Bake');
    dish.ingredients = [{ ingredientId: 'apple', amount: 2, unit: 'cup' }];
    const result = validateHardModeIngredients(dish, ['apple', 'cinnamon', 'butter']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('cinnamon');
  });
});
