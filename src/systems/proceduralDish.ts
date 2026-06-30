import type { Dish, DishAppearance, DishBowl, MeasuredIngredient } from '../types';

const PLATES = ['round', 'square', 'oval'];
const BASES = ['cake', 'bread', 'cookie', 'pie', 'tart', 'cupcake'];
const FROSTINGS = ['none', 'buttercream', 'glaze', 'chocolate'];
const COLORS = ['#f5deb3', '#8b4513', '#ffd699', '#ffb6c1', '#c68642', '#fff8dc', '#d2691e'];

export function generateProceduralAppearance(
  ingredients: MeasuredIngredient[],
  name: string,
): DishAppearance {
  const seed = hashString(name + ingredients.map((i) => i.ingredientId).join(','));
  const hasChocolate = ingredients.some((i) => i.ingredientId.includes('chocolate') || i.ingredientId.includes('cocoa'));
  const hasFruit = ingredients.some((i) => ['fruit', 'berry'].some((f) => i.ingredientId.includes(f)));
  const layers = Math.min(4, 1 + Math.floor(ingredients.length / 3));

  return {
    plateShape: PLATES[seed % PLATES.length],
    baseShape: hasChocolate ? 'brownie' : BASES[seed % BASES.length],
    frosting: FROSTINGS[(seed >> 2) % FROSTINGS.length],
    topping: hasFruit ? 'berries' : seed % 2 === 0 ? 'crumbs' : 'drizzle',
    color: hasChocolate ? '#5c3317' : COLORS[seed % COLORS.length],
    garnish: hasFruit ? 'mint' : undefined,
    layers,
  };
}

export function createEmptyDish(name = 'Untitled Dish'): Dish {
  const bowl = createBowl(1);
  return {
    id: `dish_${Date.now()}`,
    name,
    ingredients: [],
    bowls: [bowl],
    activeBowlId: bowl.id,
    techniques: [],
    states: [],
    appearance: generateProceduralAppearance([], name),
    unknownClass: 'dubious',
    submitted: false,
  };
}

export function createBowl(index: number): DishBowl {
  return {
    id: `bowl_${Date.now()}_${index}`,
    name: `Bowl ${index}`,
    ingredients: [],
    techniques: [],
    states: [],
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function filterDishName(name: string): string {
  const blocked = ['poison', 'kill', 'blood', 'drug', 'wine', 'beer', 'vodka'];
  let safe = name.trim().slice(0, 40);
  for (const word of blocked) {
    safe = safe.replace(new RegExp(word, 'gi'), '');
  }
  return safe.trim() || 'Mystery Bake';
}
