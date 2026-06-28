import type { RatingTier } from '../types';

export const RATING_TIERS: RatingTier[] = [
  { min: 0, max: 99, name: 'Kitchen Disaster' },
  { min: 100, max: 199, name: 'Kitchen Screw-Up' },
  { min: 200, max: 399, name: 'Beginner' },
  { min: 400, max: 599, name: 'Home Helper' },
  { min: 600, max: 799, name: 'Mixing Apprentice' },
  { min: 800, max: 999, name: 'Junior Baker' },
  { min: 1000, max: 1199, name: 'Skilled Baker' },
  { min: 1200, max: 1399, name: 'Kitchen Competitor' },
  { min: 1400, max: 1599, name: 'Rising Pastry Star' },
  { min: 1600, max: 1799, name: 'Advanced Baker' },
  { min: 1800, max: 1999, name: 'Championship Baker' },
  { min: 2000, max: 2199, name: 'Expert Pastry Chef' },
  { min: 2200, max: 2399, name: 'Master Baker' },
  { min: 2400, max: 2599, name: 'Grand Champion' },
  { min: 2600, max: 2799, name: 'Baking Legend' },
  { min: 2800, max: 3000, name: 'Ultimate Baking Champion' },
];

export function getTierForRating(rating: number): RatingTier {
  const clamped = Math.max(0, Math.min(3000, Math.round(rating)));
  return RATING_TIERS.find((t) => clamped >= t.min && clamped <= t.max) ?? RATING_TIERS[0];
}
