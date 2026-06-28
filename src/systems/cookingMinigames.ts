import type { CookingTechnique, FoodState, KitchenStationType } from '../types';

export interface MiniGameInput {
  durationMs: number;
  taps?: number;
  dragDistance?: number;
  circularMotion?: number;
  verticalMotion?: number;
  targetAmount?: number;
  actualAmount?: number;
  temperatureF?: number;
  targetTempF?: number;
  bakeMinutes?: number;
  targetMinutes?: number;
}

export interface MiniGameResult {
  quality: number;
  states: FoodState[];
  technique: CookingTechnique;
  message: string;
}

const STATION_TECHNIQUE: Partial<Record<KitchenStationType, CookingTechnique>> = {
  measuring: 'measure',
  hand_mixing: 'stir',
  electric_mixer: 'beat',
  blender: 'blend',
  food_processor: 'process',
  cutting: 'chop',
  oven: 'bake',
  decorating: 'decorate',
  plating: 'plate',
  proofing: 'proof',
  cooling: 'cool',
};

export function getTechniqueForStation(type: KitchenStationType): CookingTechnique {
  return STATION_TECHNIQUE[type] ?? 'assemble';
}

export function evaluateMixing(input: MiniGameInput): MiniGameResult {
  const motionScore = Math.min(1, ((input.circularMotion ?? 0) + (input.verticalMotion ?? 0)) / 200);
  const durationScore = Math.min(1, input.durationMs / 4000);
  const tapScore = Math.min(1, (input.taps ?? 0) / 20);
  const quality = (motionScore * 0.4 + durationScore * 0.35 + tapScore * 0.25) * 100;
  const states: FoodState[] = [];
  if (quality < 40) states.push('undermixed');
  if (quality > 95) states.push('overmixed');
  return {
    quality,
    states,
    technique: 'stir',
    message: quality >= 60 ? 'Nice mixing!' : 'Keep going — mix more evenly.',
  };
}

export function evaluateMeasuring(input: MiniGameInput): MiniGameResult {
  const target = input.targetAmount ?? 1;
  const actual = input.actualAmount ?? target;
  const ratio = actual / target;
  const quality = Math.max(0, 100 - Math.abs(1 - ratio) * 80);
  const states: FoodState[] = quality < 50 ? ['too_salty'] : [];
  return {
    quality,
    states,
    technique: 'measure',
    message: quality >= 70 ? 'Well measured!' : 'Measurement was a bit off.',
  };
}

export function evaluateOven(input: MiniGameInput): MiniGameResult {
  const tempDiff = Math.abs((input.temperatureF ?? 350) - (input.targetTempF ?? 350));
  const timeDiff = Math.abs((input.bakeMinutes ?? 25) - (input.targetMinutes ?? 25));
  const tempScore = Math.max(0, 100 - tempDiff / 3);
  const timeScore = Math.max(0, 100 - timeDiff * 4);
  const quality = (tempScore + timeScore) / 2;
  const states: FoodState[] = [];
  if ((input.bakeMinutes ?? 0) > (input.targetMinutes ?? 25) + 8) states.push('overbaked');
  if ((input.bakeMinutes ?? 0) < (input.targetMinutes ?? 25) - 5) states.push('underbaked');
  if (tempDiff > 40) states.push('uneven');
  if (quality >= 70) states.push('perfect');
  return {
    quality,
    states,
    technique: 'bake',
    message: quality >= 65 ? 'Baked nicely!' : 'Oven settings need adjustment.',
  };
}

export function evaluateKneading(input: MiniGameInput): MiniGameResult {
  const rhythm = Math.min(1, (input.verticalMotion ?? 0) / 150);
  const duration = Math.min(1, input.durationMs / 5000);
  const quality = (rhythm * 0.55 + duration * 0.45) * 100;
  const states: FoodState[] = quality < 45 ? ['dense'] : [];
  return { quality, states, technique: 'knead', message: 'Dough feels good.' };
}

export function evaluateDecorating(input: MiniGameInput): MiniGameResult {
  const drag = Math.min(1, (input.dragDistance ?? 0) / 300);
  const taps = Math.min(1, (input.taps ?? 0) / 15);
  const quality = (drag * 0.6 + taps * 0.4) * 100;
  const states: FoodState[] = quality < 40 ? ['bad_decor'] : [];
  return { quality, states, technique: 'decorate', message: 'Decoration complete.' };
}

export function evaluateStation(type: KitchenStationType, input: MiniGameInput): MiniGameResult {
  switch (type) {
    case 'measuring':
      return evaluateMeasuring(input);
    case 'hand_mixing':
    case 'electric_mixer':
    case 'blender':
      return evaluateMixing(input);
    case 'oven':
      return evaluateOven(input);
    case 'proofing':
      return evaluateKneading(input);
    case 'decorating':
      return evaluateDecorating(input);
    default:
      return {
        quality: Math.min(100, 50 + input.durationMs / 100),
        states: [],
        technique: getTechniqueForStation(type),
        message: 'Action complete.',
      };
  }
}

export function mergeFoodStates(existing: FoodState[], incoming: FoodState[]): FoodState[] {
  const set = new Set([...existing, ...incoming]);
  if (set.has('perfect') && set.size > 1) set.delete('perfect');
  return [...set];
}
