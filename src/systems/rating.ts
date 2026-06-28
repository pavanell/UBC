import { getTierForRating } from '../data/ratingTiers';
import type { JudgeScore, PlayerProfile } from '../types';

const RATING_ACTIVATION_DISCOVERIES = 3;
const MAX_RATING = 3000;

export function shouldActivateRating(profile: PlayerProfile): boolean {
  return profile.discoveredRecipeIds.length >= RATING_ACTIVATION_DISCOVERIES;
}

export function updateRating(profile: PlayerProfile, score: JudgeScore, complexity: number): number {
  if (!shouldActivateRating(profile) && profile.discoveredRecipeIds.length < RATING_ACTIVATION_DISCOVERIES) {
    return profile.rating;
  }

  const performance =
    score.total * 2 +
    score.taste * 3 +
    score.presentation * 2 +
    score.creativity * 2 +
    complexity * 5;

  const delta = Math.round(performance / 20 - 8);
  profile.rating = Math.max(0, Math.min(MAX_RATING, profile.rating + delta));
  return profile.rating;
}

export function initialRatingAfterActivation(scores: number[]): number {
  if (scores.length === 0) return 250;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(200 + avg * 4);
}

export function getRatingDisplay(profile: PlayerProfile): string {
  if (!shouldActivateRating(profile)) {
    const remaining = RATING_ACTIVATION_DISCOVERIES - profile.discoveredRecipeIds.length;
    return `Discover ${remaining} more recipe${remaining === 1 ? '' : 's'} to unlock Rating`;
  }
  const tier = getTierForRating(profile.rating);
  return `${profile.rating} — ${tier.name}`;
}

export function recordDiscovery(profile: PlayerProfile, recipeId: string): void {
  if (!profile.discoveredRecipeIds.includes(recipeId)) {
    profile.discoveredRecipeIds.push(recipeId);
  }
}
