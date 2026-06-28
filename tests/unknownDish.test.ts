import { describe, expect, it } from 'vitest';
import { classifyUnknownDish } from '../src/systems/recipeMatching';

describe('unknownDish', () => {
  it('flags blocked names as inedible', () => {
    expect(classifyUnknownDish([{ ingredientId: 'flour', amount: 1, unit: 'cup' }], 'poison pie')).toBe(
      'inedible',
    );
  });

  it('allows plausible combos as dubious', () => {
    expect(
      classifyUnknownDish(
        [
          { ingredientId: 'all_purpose_flour', amount: 1, unit: 'cup' },
          { ingredientId: 'milk', amount: 1, unit: 'cup' },
          { ingredientId: 'egg', amount: 2, unit: 'each' },
        ],
        'Kitchen Sink Muffin',
      ),
    ).toBe('dubious');
  });
});
