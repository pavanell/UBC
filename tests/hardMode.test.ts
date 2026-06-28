import { describe, expect, it } from 'vitest';
import { validateHardModeIngredients } from '../src/systems/judging';
import { createEmptyDish } from '../src/systems/proceduralDish';

describe('hardMode', () => {
  it('passes when all required ingredients are used', () => {
    const dish = createEmptyDish('Hard');
    dish.ingredients = [
      { ingredientId: 'apple', amount: 2, unit: 'cup' },
      { ingredientId: 'cinnamon', amount: 1, unit: 'tsp' },
      { ingredientId: 'butter', amount: 0.5, unit: 'cup' },
    ];
    const result = validateHardModeIngredients(dish, ['apple', 'cinnamon', 'butter']);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
});
