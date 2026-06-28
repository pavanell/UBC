import type { Challenge, Contestant, Dish, JudgeScore } from '../types';
import { randomBakerName } from '../data/contestantNames';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { createEmptyDish, generateProceduralAppearance } from './proceduralDish';
import { scoreDish } from './judging';
import type { CharacterAppearance, PlayerProfile } from '../types';

const HAIR_STYLES = ['short', 'curly', 'ponytail', 'braids', 'bun'];
const HAIR_COLORS = ['#4a3728', '#2c1810', '#d4a574', '#f4d03f', '#a0522d'];
const SKIN_TONES = ['#ffdbac', '#f5c99a', '#e0ac69', '#c68642', '#8d5524'];
const CLOTHING = ['apron', 'chef_jacket', 'hoodie', 'striped_shirt'];
const CLOTHING_COLORS = ['#c45c26', '#5b7c99', '#8fbc8f', '#d4a5a5', '#6b4c9a'];

export function randomAppearance(): CharacterAppearance {
  return {
    gender: 'nonbinary',
    hairstyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    clothing: CLOTHING[Math.floor(Math.random() * CLOTHING.length)],
    clothingColor: CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)],
  };
}

export function createContestants(player: PlayerProfile): Contestant[] {
  const usedNames: string[] = [player.name];
  const playerRating = Math.max(200, player.rating || 400);

  const contestants: Contestant[] = [
    {
      id: 'player',
      name: player.name,
      isPlayer: true,
      skillLevel: playerRating,
      appearance: player.appearance,
      eliminated: false,
    },
  ];

  for (let i = 0; i < 4; i++) {
    const name = randomBakerName(usedNames);
    usedNames.push(name);
    const variance = Math.floor(Math.random() * 120) - 60;
    contestants.push({
      id: `ai_${i}`,
      name,
      isPlayer: false,
      skillLevel: Math.max(150, playerRating + variance),
      appearance: randomAppearance(),
      eliminated: false,
    });
  }

  return contestants;
}

export function simulateAiDish(contestant: Contestant, challenge: Challenge): Dish {
  const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const mistakeChance = Math.max(0.05, 0.35 - contestant.skillLevel / 5000);
  const madeMistake = Math.random() < mistakeChance;

  const ingredients = recipe.requiredIngredients.slice(0, 5).map((req) => ({
    ingredientId: req.ingredientId,
    amount: (req.minAmount + req.maxAmount) / 2,
    unit: req.unit,
  }));

  if (challenge.requiredIngredients?.length) {
    for (const reqId of challenge.requiredIngredients) {
      if (!ingredients.some((i) => i.ingredientId === reqId)) {
        const ing = INGREDIENTS.find((i) => i.id === reqId);
        if (ing) ingredients.push({ ingredientId: reqId, amount: 1, unit: ing.defaultUnit });
      }
    }
  }

  const dish = createEmptyDish(recipe.name);
  dish.recipeId = recipe.id;
  dish.name = recipe.name;
  dish.ingredients = ingredients;
  dish.techniques = [...recipe.requiredTechniques];
  dish.appearance = generateProceduralAppearance(ingredients, recipe.name);
  dish.ovenTempF = recipe.temperatureRangeF
    ? Math.round((recipe.temperatureRangeF[0] + recipe.temperatureRangeF[1]) / 2)
    : 350;
  dish.bakeTimeMinutes = recipe.timeRangeMinutes
    ? Math.round((recipe.timeRangeMinutes[0] + recipe.timeRangeMinutes[1]) / 2)
    : 25;

  if (madeMistake) {
    dish.states.push(Math.random() > 0.5 ? 'overbaked' : 'dry');
  } else {
    dish.states.push('perfect');
  }

  dish.unknownClass = 'known';
  dish.submitted = true;
  return dish;
}

export function simulateAiScore(contestant: Contestant, dish: Dish, challenge: Challenge): JudgeScore {
  const skillBonus = Math.floor((contestant.skillLevel - 200) / 100);
  return scoreDish(dish, challenge, skillBonus);
}

export function findLowestScorers(contestants: Contestant[]): Contestant[] {
  const active = contestants.filter((c) => !c.eliminated && c.lastScore);
  if (!active.length) return [];
  const minScore = Math.min(...active.map((c) => c.lastScore!.total));
  return active.filter((c) => c.lastScore!.total === minScore);
}

export function pickEliminationWheel(contestants: Contestant[]): Contestant {
  return contestants[Math.floor(Math.random() * contestants.length)];
}
