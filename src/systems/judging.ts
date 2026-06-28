import type { Challenge, Dish, FoodState, JudgeScore } from '../types';
import { getRecipeById } from '../data/recipes';
import { resolveDishClassification } from './recipeMatching';

const STATE_PENALTIES: Partial<Record<FoodState, { taste: number; presentation: number }>> = {
  burned: { taste: 25, presentation: 15 },
  underbaked: { taste: 20, presentation: 10 },
  raw: { taste: 30, presentation: 5 },
  dry: { taste: 15, presentation: 5 },
  soggy: { taste: 12, presentation: 10 },
  overmixed: { taste: 10, presentation: 5 },
  undermixed: { taste: 10, presentation: 5 },
  curdled: { taste: 18, presentation: 8 },
  collapsed: { taste: 8, presentation: 20 },
  dense: { taste: 10, presentation: 8 },
  too_wet: { taste: 12, presentation: 10 },
  too_salty: { taste: 15, presentation: 0 },
  too_sweet: { taste: 10, presentation: 0 },
  uneven: { taste: 5, presentation: 15 },
  poor_shape: { taste: 0, presentation: 18 },
  bad_decor: { taste: 0, presentation: 20 },
  unstable: { taste: 5, presentation: 22 },
};

const EXPLANATIONS = [
  { check: (s: JudgeScore) => s.taste >= 28, text: 'Great flavor and lovely texture.' },
  { check: (s: JudgeScore) => s.presentation >= 28, text: 'Beautiful presentation and a creative filling.' },
  { check: (s: JudgeScore) => s.taste < 18, text: 'Interesting idea, but the textures did not work together.' },
  { check: (s: JudgeScore) => s.presentation < 18, text: 'Good flavor, but plating needs polish.' },
  { check: (_s: JudgeScore) => true, text: 'Solid effort with room to grow.' },
];

export function scoreDish(dish: Dish, challenge: Challenge, skillBonus: number): JudgeScore {
  const unknownClass = resolveDishClassification(dish);
  let taste = 22 + skillBonus;
  let presentation = 22 + skillBonus;
  let creativity = 18 + Math.floor(skillBonus / 2);

  if (unknownClass === 'inedible') {
    return {
      taste: 3,
      presentation: 8,
      creativity: 10,
      total: 7,
      explanation: 'This dish is not safely edible.',
    };
  }

  if (dish.recipeId) {
    const recipe = getRecipeById(dish.recipeId);
    if (recipe) {
      taste += 5;
      presentation += 4;
      if (challenge.theme.toLowerCase().includes(recipe.category)) creativity += 6;
    }
  } else if (unknownClass === 'dubious') {
    taste -= 5;
    presentation -= 3;
    creativity += 8;
  }

  for (const state of dish.states) {
    const penalty = STATE_PENALTIES[state];
    if (penalty) {
      taste -= penalty.taste ?? 0;
      presentation -= penalty.presentation ?? 0;
    }
  }

  if (dish.techniques.length >= 4) creativity += 4;
  if (dish.ingredients.length >= 6) creativity += 3;

  if (challenge.requiredIngredients?.length) {
    const used = new Set(dish.ingredients.map((i) => i.ingredientId));
    const allUsed = challenge.requiredIngredients.every((id) => used.has(id));
    if (!allUsed) taste -= 15;
  }

  taste = clampScore(taste);
  presentation = clampScore(presentation);
  creativity = clampScore(creativity);

  const total = Math.round((taste + presentation + creativity) / 3 * (100 / 33));
  const score: JudgeScore = {
    taste,
    presentation,
    creativity,
    total: Math.max(0, Math.min(100, total)),
    explanation: '',
  };
  score.explanation = EXPLANATIONS.find((e) => e.check(score))?.text ?? 'Nice bake!';
  return score;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(33, Math.round(n)));
}

export function combinedScoreExplanation(score: JudgeScore): string {
  return `${score.explanation} Score: ${score.total}/100.`;
}

export function validateHardModeIngredients(
  dish: Dish,
  requiredIds: string[],
): { valid: boolean; missing: string[] } {
  const used = new Set(dish.ingredients.map((i) => i.ingredientId));
  const missing = requiredIds.filter((id) => !used.has(id));
  return { valid: missing.length === 0, missing };
}
