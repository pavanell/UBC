import { describe, expect, it } from 'vitest';
import { matchRecipe, classifyUnknownDish } from '../src/systems/recipeMatching';

describe('recipeMatching', () => {
  it('matches vanilla cupcake recipe', () => {
    const result = matchRecipe(
      [
        { ingredientId: 'all_purpose_flour', amount: 1.25, unit: 'cup' },
        { ingredientId: 'granulated_sugar', amount: 0.85, unit: 'cup' },
        { ingredientId: 'butter', amount: 0.6, unit: 'cup' },
        { ingredientId: 'egg', amount: 2, unit: 'each' },
        { ingredientId: 'milk', amount: 0.6, unit: 'cup' },
        { ingredientId: 'baking_powder', amount: 1.75, unit: 'tsp' },
        { ingredientId: 'vanilla_extract', amount: 1.5, unit: 'tsp' },
      ],
      ['measure', 'beat', 'bake', 'cool'],
    );
    expect(result.recipeId).toBe('vanilla_cupcake');
    expect(result.isMatch).toBe(true);
  });

  it('classifies unknown dishes', () => {
    expect(classifyUnknownDish([], 'Mystery')).toBe('inedible');
    expect(
      classifyUnknownDish(
        [
          { ingredientId: 'all_purpose_flour', amount: 2, unit: 'cup' },
          { ingredientId: 'butter', amount: 1, unit: 'cup' },
        ],
        'Experiment',
      ),
    ).toBe('dubious');
  });
});
