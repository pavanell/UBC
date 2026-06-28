import type { Challenge } from '../types';
import { INGREDIENTS } from './ingredients';

const THEMES = [
  { theme: 'Winter Wonderland Bake', description: 'Create a cozy winter-themed dessert.' },
  { theme: 'Dessert Impostor', description: 'Bake something that looks like savory food but tastes sweet.' },
  { theme: 'Celebration Dessert', description: 'Design a festive dessert for a special celebration.' },
  { theme: 'Layered Bake', description: 'Build a dessert with distinct layers.' },
  { theme: 'Pastry Challenge', description: 'Show your pastry skills with a flaky creation.' },
  { theme: 'Bread Challenge', description: 'Bake an impressive bread or roll.' },
  { theme: 'Plated Dessert', description: 'Plate a refined dessert worthy of the judges table.' },
  { theme: 'Multi-Component Finale', description: 'Combine multiple components into one showpiece.' },
  { theme: 'Giant Cake Finale', description: 'Create a towering cake for the final round.' },
  { theme: 'Savory Baking Challenge', description: 'Bake a savory pie, quiche, or bread.' },
];

const WORKABLE_HARD_COMBOS = [
  ['apple', 'cinnamon', 'butter'],
  ['banana', 'walnut', 'brown_sugar'],
  ['carrot', 'cream_cheese', 'cinnamon'],
  ['lemon', 'blueberry', 'granulated_sugar'],
  ['dark_chocolate', 'raspberry', 'heavy_cream'],
  ['pumpkin', 'nutmeg', 'all_purpose_flour'],
  ['strawberry', 'vanilla_extract', 'powdered_sugar'],
  ['cheddar', 'tomato', 'all_purpose_flour'],
];

export function generateChallenge(round: number, mode: 'normal' | 'hard'): Challenge {
  const themeIndex = Math.min(round - 1, THEMES.length - 1);
  const base = THEMES[themeIndex];
  const difficulty = round;

  const challenge: Challenge = {
    id: `round_${round}_${base.theme.toLowerCase().replace(/\s+/g, '_')}`,
    round,
    theme: base.theme,
    description: base.description,
    difficulty,
    multiComponent: round >= 3,
  };

  if (mode === 'hard') {
    const combo = WORKABLE_HARD_COMBOS[(round - 1) % WORKABLE_HARD_COMBOS.length];
    challenge.requiredIngredients = combo.filter((id) => INGREDIENTS.some((i) => i.id === id));
  }

  return challenge;
}
