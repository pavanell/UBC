export type UnitSystem = 'metric' | 'us';

export type GenderPresentation = 'girl' | 'boy' | 'nonbinary' | 'prefer_not_say';

export type GameMode = 'normal' | 'hard' | 'free_cook';

export type IngredientCategory =
  | 'flour'
  | 'sugar'
  | 'fat'
  | 'dairy'
  | 'egg'
  | 'chocolate'
  | 'fruit'
  | 'vegetable'
  | 'nut'
  | 'spice'
  | 'extract'
  | 'leavener'
  | 'starch'
  | 'grain'
  | 'filling'
  | 'decoration'
  | 'cheese'
  | 'savory'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  defaultUnit: string;
  densityGPerMl?: number;
}

export interface MeasuredIngredient {
  ingredientId: string;
  amount: number;
  unit: string;
}

export type CookingTechnique =
  | 'measure'
  | 'pour'
  | 'stir'
  | 'whisk'
  | 'beat'
  | 'fold'
  | 'knead'
  | 'roll'
  | 'shape'
  | 'cut'
  | 'chop'
  | 'blend'
  | 'process'
  | 'sift'
  | 'pipe'
  | 'frost'
  | 'decorate'
  | 'fry'
  | 'boil'
  | 'simmer'
  | 'bake'
  | 'chill'
  | 'freeze'
  | 'rest'
  | 'proof'
  | 'cool'
  | 'assemble'
  | 'plate';

export interface RecipeStep {
  technique: CookingTechnique;
  description: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  requiredIngredients: { ingredientId: string; minAmount: number; maxAmount: number; unit: string }[];
  acceptableSubstitutions?: Record<string, string[]>;
  requiredTechniques: CookingTechnique[];
  optionalTechniques?: CookingTechnique[];
  cookingMethod: string;
  temperatureRangeF?: [number, number];
  timeRangeMinutes?: [number, number];
  failureModes: string[];
  presentationTargets: string[];
  creativityOpportunities: string[];
}

export type FoodState =
  | 'raw'
  | 'underbaked'
  | 'perfect'
  | 'overbaked'
  | 'burned'
  | 'dry'
  | 'soggy'
  | 'overmixed'
  | 'undermixed'
  | 'curdled'
  | 'collapsed'
  | 'dense'
  | 'too_wet'
  | 'too_salty'
  | 'too_sweet'
  | 'uneven'
  | 'poor_shape'
  | 'bad_decor'
  | 'unstable';

export type UnknownDishClass = 'known' | 'dubious' | 'inedible';

export interface DishAppearance {
  plateShape: string;
  baseShape: string;
  crust?: string;
  filling?: string;
  frosting?: string;
  topping?: string;
  color: string;
  garnish?: string;
  layers: number;
}

export interface DishBowl {
  id: string;
  name: string;
  ingredients: MeasuredIngredient[];
  techniques: CookingTechnique[];
  states: FoodState[];
}

export interface Dish {
  id: string;
  name: string;
  ingredients: MeasuredIngredient[];
  bowls: DishBowl[];
  activeBowlId: string;
  techniques: CookingTechnique[];
  states: FoodState[];
  ovenTempF?: number;
  bakeTimeMinutes?: number;
  appearance: DishAppearance;
  recipeId?: string;
  unknownClass: UnknownDishClass;
  submitted: boolean;
}

export interface JudgeScore {
  taste: number;
  presentation: number;
  creativity: number;
  total: number;
  explanation: string;
}

export interface Challenge {
  id: string;
  round: number;
  theme: string;
  description: string;
  difficulty: number;
  requiredIngredients?: string[];
  multiComponent: boolean;
}

export interface Contestant {
  id: string;
  name: string;
  isPlayer: boolean;
  skillLevel: number;
  appearance: CharacterAppearance;
  eliminated: boolean;
  currentDish?: Dish;
  lastScore?: JudgeScore;
}

export interface CharacterAppearance {
  gender: GenderPresentation;
  hairstyle: string;
  hairColor: string;
  skinTone: string;
  clothing: string;
  clothingColor: string;
}

export interface PlayerProfile {
  name: string;
  appearance: CharacterAppearance;
  unitSystem: UnitSystem;
  rating: number;
  discoveredRecipeIds: string[];
  favoriteIngredientIds: string[];
  recentIngredientIds: string[];
  keyboardControls: KeyboardControls;
}

export interface KeyboardControls {
  up: string;
  down: string;
  left: string;
  right: string;
}

export interface RatingTier {
  min: number;
  max: number;
  name: string;
}

export interface DiscoveredRecipeEntry {
  dishName: string;
  ingredients: MeasuredIngredient[];
  unitSystem: UnitSystem;
  steps: RecipeStep[];
  techniques: CookingTechnique[];
  ovenTempF?: number;
  bakeTimeMinutes?: number;
  result: string;
  score: number;
  appearance: DishAppearance;
  discoveredAt: number;
}

export type KitchenStationType =
  | 'pantry'
  | 'refrigerator'
  | 'freezer'
  | 'sink'
  | 'measuring'
  | 'prep_counter'
  | 'cutting'
  | 'hand_mixing'
  | 'electric_mixer'
  | 'blender'
  | 'food_processor'
  | 'stove'
  | 'oven'
  | 'microwave'
  | 'proofing'
  | 'cooling'
  | 'decorating'
  | 'plating'
  | 'trash'
  | 'judging';

export interface KitchenStation {
  id: string;
  type: KitchenStationType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactable: boolean;
}

export interface CookingActionResult {
  quality: number;
  states: FoodState[];
  message: string;
}

export interface ChampionshipState {
  mode: 'normal' | 'hard';
  round: number;
  challenge: Challenge;
  contestants: Contestant[];
  phase: 'intro_judges' | 'intro_bakers' | 'announce' | 'cooking' | 'judging' | 'elimination' | 'winner';
}

export interface SessionState {
  profile: PlayerProfile | null;
  tutorialSeen: Record<string, boolean>;
  championship: ChampionshipState | null;
  freeCookActive: boolean;
  recipeLibrary: Record<string, DiscoveredRecipeEntry>;
  ratingHistory: number[];
}
