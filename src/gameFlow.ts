import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config/deployment';
import { generateChallenge } from './data/challenges';
import { getIngredientById } from './data/ingredients';
import { getRecipeById } from './data/recipes';
import { BootScene, HomeRoomScene, KitchenScene } from './scenes/gameScenes';
import { sessionStore } from './state/sessionStore';
import {
  createContestants,
  findLowestScorers,
  pickEliminationWheel,
  simulateAiDish,
  simulateAiScore,
} from './systems/aiContestants';
import { evaluateStation, mergeFoodStates } from './systems/cookingMinigames';
import { combinedScoreExplanation, scoreDish } from './systems/judging';
import { createBowl, createEmptyDish, filterDishName, generateProceduralAppearance } from './systems/proceduralDish';
import { matchRecipe } from './systems/recipeMatching';
import { getRatingDisplay, recordDiscovery, updateRating } from './systems/rating';
import type { ChampionshipState, Contestant, Dish, DishBowl, DiscoveredRecipeEntry, GameMode, KitchenStation } from './types';
import { showIngredientPicker, showMiniGamePanel } from './ui/ingredientPanel';
import { button, hideOverlay, showOverlay, speechBubble, buildCharacterCreationForm, readCharacterCreationForm } from './ui/overlay';

let game: Phaser.Game | null = null;
let currentDish: Dish = createEmptyDish();

function initPhaser(): Phaser.Game {
  if (game) return game;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#c4956a',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, HomeRoomScene, KitchenScene],
    render: { pixelArt: true, antialias: false, roundPixels: true },
  });
  return game;
}

function showLoading(): void {
  showOverlay(`<h1>Ultimate Baking Championships</h1><p>Loading kitchen...</p>`, 'panel center-panel');
}

function showCharacterCreation(): void {
  const profile = sessionStore.getProfile();
  showOverlay(buildCharacterCreationForm(profile), 'panel panel-scroll');
  document.getElementById('cc-start')?.addEventListener('click', () => {
    const data = readCharacterCreationForm();
    sessionStore.setProfile({ ...profile, ...data });
    hideOverlay();
    startHome();
  });
}

function startHome(): void {
  hideOverlay();
  initPhaser();
  game!.scene.start('HomeRoomScene');
  bindGlobalEvents();
}

function returnHome(resetChampionship = true): void {
  removeDishHud();
  hideOverlay();
  if (resetChampionship) sessionStore.resetChampionship();
  game?.events.emit('kitchen-pause', false);
  game?.scene.stop('KitchenScene');
  game?.scene.start('HomeRoomScene');
  bindGlobalEvents();
  game?.events.emit('refresh-home');
}

function bindGlobalEvents(): void {
  if (!game) return;
  game.events.off('enter-mode');
  game.events.off('open-home-menu');
  game.events.off('interact-station');
  game.events.off('open-pause');
  game.events.off('hands-up');

  game.events.on('enter-mode', (doorId: string) => {
    if (doorId === 'normal') startModeIntro('normal');
    if (doorId === 'hard') startModeIntro('hard');
    if (doorId === 'free') startModeIntro('free_cook');
  });

  game.events.on('open-home-menu', () => showHomeMenu());
  game.events.on('interact-station', (station: KitchenStation) => handleStation(station));
  game.events.on('open-pause', () => showPauseMenu());
  game.events.on('hands-up', () => submitPlayerDish());
}

function showHomeMenu(): void {
  showOverlay(`
    <h2>Home Menu</h2>
    ${button('menu-customize', 'Customize Character')}
    ${button('menu-library', 'Recipe Library')}
    ${button('menu-rating', 'Rating')}
    ${button('menu-settings', 'Settings')}
    ${button('menu-credits', 'Credits')}
    ${button('menu-close', 'Close')}
  `, 'panel');
  document.getElementById('menu-customize')?.addEventListener('click', showCharacterCreation);
  document.getElementById('menu-library')?.addEventListener('click', showRecipeLibrary);
  document.getElementById('menu-rating')?.addEventListener('click', showRatingScreen);
  document.getElementById('menu-settings')?.addEventListener('click', showSettings);
  document.getElementById('menu-credits')?.addEventListener('click', showCredits);
  document.getElementById('menu-close')?.addEventListener('click', hideOverlay);
}

function startModeIntro(mode: GameMode): void {
  const titles: Record<GameMode, string> = {
    normal: 'Normal Mode',
    hard: 'Hard Mode',
    free_cook: 'Free Cook',
  };
  const desc: Record<GameMode, string> = {
    normal: 'Four rounds. One elimination each round. Any ingredients allowed.',
    hard: 'Same championship, but each round requires three special ingredients.',
    free_cook: 'No judges, no timer. Experiment freely this session.',
  };
  showOverlay(`
    <h1>${titles[mode]}</h1>
    ${speechBubble('Host', desc[mode])}
    ${button('intro-go', 'Enter', true)}
    ${button('intro-back', 'Back')}
  `, 'panel');
  document.getElementById('intro-back')?.addEventListener('click', () => {
    hideOverlay();
    game?.scene.start('HomeRoomScene');
  });
  document.getElementById('intro-go')?.addEventListener('click', () => {
    hideOverlay();
    if (mode === 'free_cook') startFreeCook();
    else startChampionship(mode);
  });
}

function startChampionship(mode: 'normal' | 'hard'): void {
  const profile = sessionStore.getProfile();
  const contestants = createContestants(profile);
  const challenge = generateChallenge(1, mode);
  const championship: ChampionshipState = {
    mode,
    round: 1,
    challenge,
    contestants,
    phase: 'intro_judges',
  };
  sessionStore.patch({ championship, freeCookActive: false });
  currentDish = createEmptyDish(`${challenge.theme} Bake`);
  runChampionshipPhase();
}

function runChampionshipPhase(): void {
  const ch = sessionStore.getState().championship;
  if (!ch) return;

  switch (ch.phase) {
    case 'intro_judges':
      showOverlay(`
        <h2>Meet the Judges</h2>
        ${speechBubble('Josh', 'I am Josh. I love bold flavors and brave baking.')}
        ${speechBubble('Nicole', 'And I am Nicole. Presentation and creativity matter just as much.')}
        ${button('phase-next', 'Continue', true)}
      `, 'panel');
      document.getElementById('phase-next')!.onclick = () => {
        ch.phase = 'intro_bakers';
        runChampionshipPhase();
      };
      break;
    case 'intro_bakers':
      showOverlay(`
        <h2>Meet the Bakers</h2>
        ${ch.contestants.map((c) => `<p><strong>${c.name}</strong>${c.isPlayer ? ' (You)' : ''}</p>`).join('')}
        ${button('phase-next', 'Continue', true)}
      `, 'panel');
      document.getElementById('phase-next')!.onclick = () => {
        ch.phase = 'announce';
        runChampionshipPhase();
      };
      break;
    case 'announce':
      showChallengeAnnouncement(ch);
      break;
    case 'cooking':
      startKitchen(false);
      break;
    case 'judging':
      runJudging(ch);
      break;
    case 'elimination':
      runElimination(ch);
      break;
    case 'winner':
      showWinner(ch);
      break;
  }
}

function showChallengeAnnouncement(ch: ChampionshipState): void {
  const req =
    ch.challenge.requiredIngredients?.length
      ? `<p>Required: ${ch.challenge.requiredIngredients.map((id) => getIngredientById(id)?.name ?? id).join(', ')}</p>`
      : '';
  showOverlay(`
    <h2>Round ${ch.round}: ${ch.challenge.theme}</h2>
    ${speechBubble('Josh', ch.challenge.description)}
    ${speechBubble('Nicole', 'You have one hour on the challenge clock. Good luck!')}
    ${req}
    ${button('cook-start', 'Start Cooking', true)}
  `, 'panel');
  document.getElementById('cook-start')!.onclick = () => {
    ch.phase = 'cooking';
    hideOverlay();
    runChampionshipPhase();
  };
}

function startFreeCook(): void {
  sessionStore.patch({ freeCookActive: true, championship: null });
  currentDish = createEmptyDish('Free Cook Creation');
  showOverlay(`
    <h2>Free Cook</h2>
    ${speechBubble('Tip', 'Explore the kitchen. Discover recipes by baking them correctly.')}
    ${button('fc-go', 'Start', true)}
  `, 'panel');
  document.getElementById('fc-go')!.onclick = () => {
    hideOverlay();
    startKitchen(true);
  };
}

function startKitchen(freeCook: boolean): void {
  hideOverlay();
  game?.scene.start('KitchenScene');
  bindGlobalEvents();
  if (!sessionStore.hasSeenTutorial('kitchen')) {
    showOverlay(`
      ${speechBubble('Tip', 'Tap to walk. Tap stations to interact. Use pantry for ingredients.')}
      ${button('tut-ok', 'Got it', true)}
    `, 'panel');
    document.getElementById('tut-ok')!.onclick = () => {
      sessionStore.markTutorial('kitchen');
      hideOverlay();
    };
  }
  if (freeCook) {
    showDishHud(true);
  } else {
    showDishHud(false);
  }
}

function showDishHud(freeCook: boolean): void {
  removeDishHud();
  const activeBowl = getActiveBowl();
  const bowlOptions = currentDish.bowls
    .map((bowl) => `<option value="${bowl.id}" ${bowl.id === currentDish.activeBowlId ? 'selected' : ''}>${bowl.name}</option>`)
    .join('');
  const hud = document.createElement('div');
  hud.id = 'dish-hud';
  hud.className = 'dish-hud';
  hud.innerHTML = `
    <strong>${currentDish.name}</strong>
    <label class="hud-bowl-label">Bowl <select id="hud-bowl">${bowlOptions}</select></label>
    <span id="dish-ing-count">${currentDish.ingredients.length} ingredients</span>
    <span id="dish-bowl-count">${activeBowl.ingredients.length} in ${activeBowl.name}</span>
    ${button('hud-new-bowl', '+ Bowl')}
    ${freeCook ? button('hud-submit', 'Evaluate Dish', true) : ''}
  `;
  document.getElementById('app')?.appendChild(hud);
  document.getElementById('hud-bowl')?.addEventListener('change', (event) => {
    currentDish.activeBowlId = (event.target as HTMLSelectElement).value;
    showDishHud(freeCook);
  });
  document.getElementById('hud-new-bowl')?.addEventListener('click', () => {
    const bowl = createBowl(currentDish.bowls.length + 1);
    currentDish.bowls.push(bowl);
    currentDish.activeBowlId = bowl.id;
    showDishHud(freeCook);
  });
  document.getElementById('hud-submit')?.addEventListener('click', () => evaluateFreeCookDish());
}

function removeDishHud(): void {
  document.getElementById('dish-hud')?.remove();
}

function getActiveBowl(): DishBowl {
  let bowl = currentDish.bowls.find((item) => item.id === currentDish.activeBowlId);
  if (!bowl) {
    bowl = currentDish.bowls[0] ?? createBowl(1);
    if (!currentDish.bowls.length) currentDish.bowls.push(bowl);
    currentDish.activeBowlId = bowl.id;
  }
  return bowl;
}

function updateDishHudCounts(): void {
  const activeBowl = getActiveBowl();
  const total = document.getElementById('dish-ing-count');
  const bowlCount = document.getElementById('dish-bowl-count');
  if (total) total.textContent = `${currentDish.ingredients.length} ingredients`;
  if (bowlCount) bowlCount.textContent = `${activeBowl.ingredients.length} in ${activeBowl.name}`;
}

function renderDishPreview(dish: Dish): string {
  const appearance = dish.appearance;
  const layers = Array.from({ length: Math.max(1, appearance.layers) })
    .map((_, index) => `<span class="dish-layer" style="background:${appearance.color}; transform: translateY(${index * -4}px)"></span>`)
    .join('');
  const frosting = appearance.frosting && appearance.frosting !== 'none'
    ? `<span class="dish-frosting">${appearance.frosting}</span>`
    : '';
  const topping = appearance.topping ? `<span class="dish-topping">${appearance.topping}</span>` : '';
  const garnish = appearance.garnish ? `<span class="dish-garnish">${appearance.garnish}</span>` : '';
  return `
    <div class="dish-preview" aria-label="${dish.name} preview">
      <div class="dish-plate dish-plate-${appearance.plateShape}">
        <div class="dish-base dish-base-${appearance.baseShape}">
          ${layers}
          ${frosting}
          ${topping}
          ${garnish}
        </div>
      </div>
      <strong>${dish.name}</strong>
    </div>
  `;
}

function handleStation(station: KitchenStation): void {
  if (station.type === 'pantry' || station.type === 'refrigerator' || station.type === 'freezer') {
    const profile = sessionStore.getProfile();
    showIngredientPicker(
      (item) => {
        const activeBowl = getActiveBowl();
        currentDish.ingredients.push(item);
        activeBowl.ingredients.push(item);
        profile.recentIngredientIds = [item.ingredientId, ...profile.recentIngredientIds.filter((id) => id !== item.ingredientId)].slice(0, 8);
        updateDishHudCounts();
        hideOverlay();
      },
      profile.recentIngredientIds,
      profile.favoriteIngredientIds,
    );
    return;
  }

  if (station.type === 'trash') {
    currentDish = createEmptyDish('New Dish');
    showDishHud(sessionStore.getState().freeCookActive);
    return;
  }

  if (station.type === 'judging') {
    submitPlayerDish();
    return;
  }

  if (station.type === 'plating') {
    const name = prompt('Name your dish:', currentDish.name) ?? currentDish.name;
    currentDish.name = filterDishName(name);
    currentDish.appearance = generateProceduralAppearance(currentDish.ingredients, currentDish.name);
    showDishHud(sessionStore.getState().freeCookActive);
    showOverlay(`
      <h2>Plated Bake</h2>
      ${renderDishPreview(currentDish)}
      ${button('plate-ok', 'OK', true)}
    `, 'panel center-panel');
    document.getElementById('plate-ok')!.onclick = hideOverlay;
    return;
  }

  const mode =
    station.type === 'oven' ? 'oven' : station.type === 'measuring' ? 'measure' : 'mix';
  showMiniGamePanel(
    station.label,
    `Perform the ${station.label.toLowerCase()} action.`,
    (stats) => {
      const result = evaluateStation(station.type, stats);
      const activeBowl = getActiveBowl();
      currentDish.techniques.push(result.technique);
      activeBowl.techniques.push(result.technique);
      currentDish.states = mergeFoodStates(currentDish.states, result.states);
      activeBowl.states = mergeFoodStates(activeBowl.states, result.states);
      if (station.type === 'oven') {
        currentDish.ovenTempF = stats.temperatureF;
        currentDish.bakeTimeMinutes = stats.bakeMinutes;
      }
      if (station.type === 'decorating') {
        currentDish.appearance = generateProceduralAppearance(currentDish.ingredients, currentDish.name);
      }
      hideOverlay();
      const preview = station.type === 'decorating' || station.type === 'plating' || station.type === 'oven'
        ? renderDishPreview(currentDish)
        : '';
      showOverlay(`${preview}${speechBubble('Result', result.message)}${button('res-ok', 'OK', true)}`, preview ? 'panel center-panel' : 'panel');
      document.getElementById('res-ok')!.onclick = hideOverlay;
    },
    { mode },
  );
}

function submitPlayerDish(): void {
  currentDish.submitted = true;
  const ch = sessionStore.getState().championship;
  removeDishHud();
  game?.events.emit('kitchen-pause', true);

  if (!ch) {
    evaluateFreeCookDish();
    return;
  }

  const player = ch.contestants.find((c) => c.isPlayer)!;
  player.currentDish = { ...currentDish };

  for (const c of ch.contestants) {
    if (!c.isPlayer && !c.eliminated) {
      c.currentDish = simulateAiDish(c, ch.challenge);
      c.lastScore = simulateAiScore(c, c.currentDish, ch.challenge);
    }
  }

  const skillBonus = Math.floor((sessionStore.getProfile().rating || 400) / 200);
  player.lastScore = scoreDish(currentDish, ch.challenge, skillBonus);
  ch.phase = 'judging';
  hideOverlay();
  runChampionshipPhase();
}

function runJudging(ch: ChampionshipState): void {
  const active = ch.contestants.filter((c) => !c.eliminated);
  let html = `<h2>Judging — Round ${ch.round}</h2>`;
  for (const c of active) {
    html += speechBubble('Nicole', `${c.name}: ${c.lastScore?.total ?? 0}/100. ${c.lastScore ? combinedScoreExplanation(c.lastScore) : ''}`);
  }
  html += button('judge-next', 'Continue', true);
  showOverlay(html, 'panel panel-scroll');
  document.getElementById('judge-next')!.onclick = () => {
    hideOverlay();
    ch.phase = 'elimination';
    runChampionshipPhase();
  };
}

function runElimination(ch: ChampionshipState): void {
  const remaining = ch.contestants.filter((c) => !c.eliminated);
  if (remaining.length <= 1) {
    ch.phase = 'winner';
    runChampionshipPhase();
    return;
  }

  const lowest = findLowestScorers(ch.contestants);
  let eliminated: Contestant;
  if (lowest.length > 1) {
    eliminated = pickEliminationWheel(lowest);
    showOverlay(`
      <h2>Tie Breaker!</h2>
      <p>Spinner wheel chooses...</p>
      <p><strong>${eliminated.name}</strong> is eliminated.</p>
      ${button('elim-next', 'Continue', true)}
    `, 'panel');
  } else {
    eliminated = lowest[0];
    showOverlay(`
      <h2>Elimination</h2>
      ${speechBubble('Josh', `${eliminated.name}, your time in the tent is over.`)}
      ${button('elim-next', 'Continue', true)}
    `, 'panel');
  }

  document.getElementById('elim-next')!.onclick = () => {
    eliminated.eliminated = true;
    hideOverlay();

    if (eliminated.isPlayer) {
      showOverlay(`
        <h2>You were eliminated</h2>
        ${button('home-go', 'Return to Home Room', true)}
      `, 'panel');
      document.getElementById('home-go')!.onclick = () => {
        returnHome();
      };
      return;
    }

    if (remaining.filter((c) => !c.eliminated).length <= 1) {
      ch.phase = 'winner';
      runChampionshipPhase();
      return;
    }

    ch.round += 1;
    ch.challenge = generateChallenge(ch.round, ch.mode);
    ch.phase = 'announce';
    currentDish = createEmptyDish(`${ch.challenge.theme} Bake`);
    runChampionshipPhase();
  };
}

function showWinner(ch: ChampionshipState): void {
  const winner = ch.contestants.find((c) => !c.eliminated)!;
  showOverlay(`
    <h1>Winner: ${winner.name}!</h1>
    ${speechBubble('Nicole', winner.isPlayer ? 'Congratulations, champion!' : 'Great competition everyone!')}
    ${button('home-go', 'Return to Home Room', true)}
  `, 'panel');
  document.getElementById('home-go')!.onclick = () => {
    returnHome();
  };
}

function evaluateFreeCookDish(): void {
  const match = matchRecipe(currentDish.ingredients, currentDish.techniques);
  if (match.isMatch && match.recipeId) {
    currentDish.recipeId = match.recipeId;
    const profile = sessionStore.getProfile();
    recordDiscovery(profile, match.recipeId);
    const score = scoreDish(currentDish, {
      id: 'free',
      round: 0,
      theme: 'Free Cook',
      description: '',
      difficulty: 1,
      multiComponent: false,
    }, 5);
    updateRating(profile, score, currentDish.ingredients.length);
    const entry: DiscoveredRecipeEntry = {
      dishName: getRecipeById(match.recipeId)?.name ?? currentDish.name,
      ingredients: [...currentDish.ingredients],
      unitSystem: profile.unitSystem,
      steps: [],
      techniques: [...currentDish.techniques],
      ovenTempF: currentDish.ovenTempF,
      bakeTimeMinutes: currentDish.bakeTimeMinutes,
      result: score.explanation,
      score: score.total,
      appearance: currentDish.appearance,
      discoveredAt: Date.now(),
    };
    const lib = { ...sessionStore.getState().recipeLibrary, [match.recipeId]: entry };
    sessionStore.patch({ recipeLibrary: lib });
    showOverlay(`
      <h2>Recipe Discovered!</h2>
      ${speechBubble('Tip', `${entry.dishName} added to your library. Score: ${score.total}`)}
      ${button('fc-ok', 'Keep Cooking', true)}
    `, 'panel');
    document.getElementById('fc-ok')!.onclick = hideOverlay;
    game?.events.emit('refresh-home');
  } else {
    showOverlay(`
      <h2>Dish Evaluated</h2>
      ${speechBubble('Tip', 'Keep experimenting to discover recipes!')}
      ${button('fc-ok', 'OK', true)}
    `, 'panel');
    document.getElementById('fc-ok')!.onclick = hideOverlay;
  }
}

function showRecipeLibrary(): void {
  const lib = sessionStore.getState().recipeLibrary;
  const keys = Object.keys(lib);
  const content =
    keys.length === 0
      ? '<p>Your library is empty. Discover recipes by baking them correctly.</p>'
      : keys.map((k) => {
          const e = lib[k];
          return `<div class="recipe-entry"><strong>${e.dishName}</strong> — Score ${e.score}<br/><small>${e.ingredients.map((i) => getIngredientById(i.ingredientId)?.name).join(', ')}</small></div>`;
        }).join('');
  showOverlay(`<h2>Recipe Library</h2>${content}${button('lib-close', 'Close')}`, 'panel panel-scroll');
  document.getElementById('lib-close')!.onclick = hideOverlay;
}

function showRatingScreen(): void {
  const profile = sessionStore.getProfile();
  showOverlay(`<h2>Rating</h2><p>${getRatingDisplay(profile)}</p>${button('r-close', 'Close')}`, 'panel');
  document.getElementById('r-close')!.onclick = hideOverlay;
}

function showSettings(): void {
  const profile = sessionStore.getProfile();
  const kc = profile.keyboardControls;
  showOverlay(`
    <h2>Settings</h2>
    <label>Up <input id="set-up" value="${kc.up}" /></label>
    <label>Down <input id="set-down" value="${kc.down}" /></label>
    <label>Left <input id="set-left" value="${kc.left}" /></label>
    <label>Right <input id="set-right" value="${kc.right}" /></label>
    ${button('set-save', 'Save', true)}
    ${button('set-close', 'Close')}
  `, 'panel');
  document.getElementById('set-save')!.onclick = () => {
    profile.keyboardControls = {
      up: (document.getElementById('set-up') as HTMLInputElement).value,
      down: (document.getElementById('set-down') as HTMLInputElement).value,
      left: (document.getElementById('set-left') as HTMLInputElement).value,
      right: (document.getElementById('set-right') as HTMLInputElement).value,
    };
    hideOverlay();
  };
  document.getElementById('set-close')!.onclick = hideOverlay;
}

function showCredits(): void {
  showOverlay(`
    <h2>Credits</h2>
    <p>Ultimate Baking Championships — original prototype.</p>
    <p>Built with Phaser 3, TypeScript, and Vite.</p>
    ${button('cred-close', 'Close')}
  `, 'panel');
  document.getElementById('cred-close')!.onclick = hideOverlay;
}

function showPauseMenu(): void {
  game?.events.emit('kitchen-pause', true);
  showOverlay(`
    <h2>Paused</h2>
    ${button('pause-resume', 'Resume', true)}
    ${button('pause-restart', 'Restart Round')}
    ${button('pause-home', 'Return to Home Room')}
    ${button('pause-settings', 'Settings')}
  `, 'panel');
  document.getElementById('pause-resume')!.onclick = () => {
    hideOverlay();
    game?.events.emit('kitchen-pause', false);
  };
  document.getElementById('pause-restart')!.onclick = () => {
    hideOverlay();
    currentDish = createEmptyDish('New Dish');
    game?.events.emit('kitchen-pause', false);
    game?.scene.start('KitchenScene');
  };
  document.getElementById('pause-home')!.onclick = () => {
    returnHome();
  };
  document.getElementById('pause-settings')!.onclick = showSettings;
}

export function bootstrapGame(): void {
  showLoading();
  setTimeout(() => {
    if (!sessionStore.getState().profile) {
      showCharacterCreation();
    } else {
      startHome();
    }
  }, 400);
}

// SPA redirect for GitHub Pages
const redirect = sessionStorage.getItem('spa-redirect');
if (redirect) {
  sessionStorage.removeItem('spa-redirect');
  history.replaceState(null, '', redirect);
}
