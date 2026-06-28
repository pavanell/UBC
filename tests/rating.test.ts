import { describe, expect, it } from 'vitest';
import { shouldActivateRating, updateRating } from '../src/systems/rating';
import type { PlayerProfile } from '../src/types';

function profile(discovered: string[], rating = 0): PlayerProfile {
  return {
    name: 'Test',
    appearance: {
      gender: 'girl',
      hairstyle: 'short',
      hairColor: '#000',
      skinTone: '#fff',
      clothing: 'apron',
      clothingColor: '#f00',
    },
    unitSystem: 'us',
    rating,
    discoveredRecipeIds: discovered,
    favoriteIngredientIds: [],
    recentIngredientIds: [],
    keyboardControls: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
  };
}

describe('rating', () => {
  it('activates after three discoveries', () => {
    expect(shouldActivateRating(profile([]))).toBe(false);
    expect(shouldActivateRating(profile(['a', 'b']))).toBe(false);
    expect(shouldActivateRating(profile(['a', 'b', 'c']))).toBe(true);
  });

  it('updates rating within bounds', () => {
    const p = profile(['a', 'b', 'c'], 500);
    const next = updateRating(p, { taste: 25, presentation: 25, creativity: 25, total: 80, explanation: '' }, 3);
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThanOrEqual(3000);
  });
});
