import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('loads core data and systems', async () => {
    const ingredients = await import('../src/data/ingredients');
    const recipes = await import('../src/data/recipes');
    const judging = await import('../src/systems/judging');
    expect(ingredients.INGREDIENTS.length).toBeGreaterThan(40);
    expect(recipes.RECIPES.length).toBeGreaterThan(5);
    expect(judging.scoreDish).toBeTypeOf('function');
  });
});
