import { describe, expect, it } from 'vitest';
import { validateIngredientQuantity, compareQuantityToRange } from '../src/systems/ingredientQuantity';

describe('ingredientQuantity', () => {
  it('rejects zero or negative amounts', () => {
    expect(validateIngredientQuantity('flour', 0, 'cup').valid).toBe(false);
    expect(validateIngredientQuantity('all_purpose_flour', -1, 'cup').valid).toBe(false);
  });

  it('accepts realistic amounts', () => {
    expect(validateIngredientQuantity('all_purpose_flour', 2, 'cup').valid).toBe(true);
  });

  it('scores quantity within range higher', () => {
    const inRange = compareQuantityToRange(
      { ingredientId: 'all_purpose_flour', amount: 1.25, unit: 'cup' },
      1,
      1.5,
      'cup',
    );
    const outRange = compareQuantityToRange(
      { ingredientId: 'all_purpose_flour', amount: 5, unit: 'cup' },
      1,
      1.5,
      'cup',
    );
    expect(inRange).toBeGreaterThan(outRange);
  });
});
