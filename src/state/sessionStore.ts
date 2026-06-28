import type { SessionState, PlayerProfile } from '../types';

const defaultKeyboard = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

const defaultProfile = (): PlayerProfile => ({
  name: 'Baker',
  appearance: {
    gender: 'girl',
    hairstyle: 'short',
    hairColor: '#4a3728',
    skinTone: '#f5c99a',
    clothing: 'apron',
    clothingColor: '#c45c26',
  },
  unitSystem: 'us',
  rating: 0,
  discoveredRecipeIds: [],
  favoriteIngredientIds: [],
  recentIngredientIds: [],
  keyboardControls: { ...defaultKeyboard },
});

class SessionStore {
  private state: SessionState = {
    profile: null,
    tutorialSeen: {},
    championship: null,
    freeCookActive: false,
    recipeLibrary: {},
    ratingHistory: [],
  };

  getState(): SessionState {
    return this.state;
  }

  getProfile(): PlayerProfile {
    if (!this.state.profile) {
      this.state.profile = defaultProfile();
    }
    return this.state.profile;
  }

  setProfile(profile: PlayerProfile): void {
    this.state.profile = profile;
  }

  resetChampionship(): void {
    this.state.championship = null;
  }

  patch(partial: Partial<SessionState>): void {
    this.state = { ...this.state, ...partial };
  }

  markTutorial(key: string): void {
    this.state.tutorialSeen[key] = true;
  }

  hasSeenTutorial(key: string): boolean {
    return !!this.state.tutorialSeen[key];
  }
}

export const sessionStore = new SessionStore();
