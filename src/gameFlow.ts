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
import type { ChampionshipState, Contestant, Dish, DishBowl, DiscoveredRecipeEntry, FoodState, GameMode, KitchenStation } from './types';
import { showIngredientPicker } from './ui/ingredientPanel';
import { button, hideOverlay, showOverlay, speechBubble, buildCharacterCreationForm, readCharacterCreationForm } from './ui/overlay';

let game: Phaser.Game | null = null;
let currentDish: Dish = createEmptyDish();

const PANTRY_CATEGORIES = ['flour', 'sugar', 'chocolate', 'nut', 'spice', 'extract', 'leavener', 'starch', 'grain', 'decoration', 'other'];
const FRIDGE_CATEGORIES = ['dairy', 'egg', 'fruit', 'vegetable', 'filling', 'cheese', 'savory'];
const FREEZER_CATEGORIES = ['fruit', 'dairy', 'filling'];

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
      ${speechBubble('Tip', 'Move around the kitchen. Stand near a station and press Space or Enter to use it.')}
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

function ingredientName(id: string): string {
  return getIngredientById(id)?.name ?? id;
}

function ingredientVisualClass(id: string): string {
  const category = getIngredientById(id)?.category ?? 'other';
  return `ingredient-token ingredient-${category}`;
}

function renderIngredientTokens(bowl: DishBowl): string {
  return bowl.ingredients
    .slice(0, 12)
    .map((item, index) => `<span class="${ingredientVisualClass(item.ingredientId)}" title="${ingredientName(item.ingredientId)}" style="--i:${index}"></span>`)
    .join('');
}

function renderBowlList(bowls = currentDish.bowls): string {
  return bowls.map((bowl) => {
    const isActive = bowl.id === currentDish.activeBowlId ? ' active' : '';
    const ingredients = bowl.ingredients.length
      ? bowl.ingredients.map((item) => `<li>${item.amount} ${item.unit} ${ingredientName(item.ingredientId)}</li>`).join('')
      : '<li>Empty</li>';
    return `
      <section class="bowl-card${isActive}" data-bowl-id="${bowl.id}">
        <div class="bowl-visual">${renderIngredientTokens(bowl)}</div>
        <div>
          <strong>${bowl.name}</strong>
          <ul>${ingredients}</ul>
        </div>
      </section>
    `;
  }).join('');
}

function showBowlsPanel(): void {
  showOverlay(`
    <h2>Bowl Station</h2>
    <div class="bowl-grid">${renderBowlList()}</div>
    ${button('bowls-new', '+ Bowl')}
    ${button('bowls-close', 'Close', true)}
  `, 'panel panel-scroll');
  document.querySelectorAll<HTMLElement>('.bowl-card[data-bowl-id]').forEach((card) => {
    card.addEventListener('click', () => {
      currentDish.activeBowlId = card.dataset.bowlId ?? currentDish.activeBowlId;
      showDishHud(sessionStore.getState().freeCookActive);
      showBowlsPanel();
    });
  });
  document.getElementById('bowls-new')!.onclick = () => {
    const bowl = createBowl(currentDish.bowls.length + 1);
    currentDish.bowls.push(bowl);
    currentDish.activeBowlId = bowl.id;
    showDishHud(sessionStore.getState().freeCookActive);
    showBowlsPanel();
  };
  document.getElementById('bowls-close')!.onclick = hideOverlay;
}

function renderDishPreview(dish: Dish, context: 'plate' | 'pan' = 'plate'): string {
  const appearance = dish.appearance;
  const stage = appearance.bakeStage ?? 'raw';
  const layers = Array.from({ length: Math.max(1, appearance.layers) })
    .map((_, index) => `<span class="dish-layer" style="background:${appearance.color}; transform: translateY(${index * -4}px)"></span>`)
    .join('');
  const frosting = appearance.frosting && appearance.frosting !== 'none'
    ? `<span class="dish-frosting">${appearance.frosting}</span>`
    : '';
  const topping = appearance.topping ? `<span class="dish-topping">${appearance.topping}</span>` : '';
  const garnish = appearance.garnish ? `<span class="dish-garnish">${appearance.garnish}</span>` : '';
  const vesselClass = context === 'pan'
    ? `dish-pan dish-pan-${appearance.panShape ?? 'round'}`
    : `dish-plate dish-plate-${appearance.plateShape}`;
  return `
    <div class="dish-preview dish-stage-${stage}" aria-label="${dish.name} preview">
      <div class="${vesselClass}">
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

function showMixerPanel(station: KitchenStation): void {
  const selected = new Set<string>();
  const render = () => {
    showOverlay(`
      <h2>${station.label}</h2>
      <div class="mixer-layout">
        <div id="mixer-drop" class="mixer-drop">
          <div class="mixer-machine"></div>
          <strong>Mixer</strong>
          <span>Drag bowls here</span>
        </div>
        <div class="mixer-bowls">${currentDish.bowls.map((bowl) => `
          <button type="button" class="bowl-card mixer-bowl${selected.has(bowl.id) ? ' selected' : ''}" draggable="true" data-bowl-id="${bowl.id}">
            <div class="bowl-visual">${renderIngredientTokens(bowl)}</div>
            <strong>${bowl.name}</strong>
            <small>${bowl.ingredients.map((item) => ingredientName(item.ingredientId)).join(', ') || 'Empty'}</small>
          </button>
        `).join('')}</div>
      </div>
      ${button('mixer-run', 'Turn on Mixer', true)}
      ${button('mixer-close', 'Close')}
    `, 'panel panel-scroll');
    bindMixerPanel(station, selected, render);
  };
  render();
}

function showOvenPanel(): void {
  const sourceBowls = currentDish.bowls.filter((bowl) => bowl.ingredients.length > 0);
  const selectedId = getActiveBowl().ingredients.length ? getActiveBowl().id : sourceBowls[0]?.id;
  let bowlId = selectedId ?? '';
  const render = () => {
    const bowl = currentDish.bowls.find((item) => item.id === bowlId);
    showOverlay(`
      <h2>Oven</h2>
      <label>Fill pan from bowl
        <select id="oven-bowl">
          ${sourceBowls.map((item) => `<option value="${item.id}" ${item.id === bowlId ? 'selected' : ''}>${item.name}</option>`).join('')}
        </select>
      </label>
      <div class="oven-layout">
        <div class="oven-box"><div class="oven-rack">${bowl ? renderDishPreview(currentDish, 'pan') : ''}</div></div>
        <div class="bowl-card">${bowl ? `<div class="bowl-visual">${renderIngredientTokens(bowl)}</div><div><strong>${bowl.name}</strong><small>${bowl.ingredients.map((item) => ingredientName(item.ingredientId)).join(', ')}</small></div>` : '<strong>No filled bowls</strong>'}</div>
      </div>
      <label>Temp (F) <input id="oven-temp" type="number" value="350" /></label>
      <label>Time (min) <input id="oven-time" type="number" value="25" /></label>
      ${button('oven-bake', 'Put Pan in Oven', true)}
      ${button('oven-close', 'Close')}
    `, 'panel panel-scroll');
    document.getElementById('oven-bowl')?.addEventListener('change', (event) => {
      bowlId = (event.target as HTMLSelectElement).value;
      render();
    });
    document.getElementById('oven-close')!.onclick = hideOverlay;
    document.getElementById('oven-bake')!.onclick = () => {
      const bowl = currentDish.bowls.find((item) => item.id === bowlId);
      if (!bowl) {
        alert('Choose a bowl with ingredients.');
        return;
      }
      currentDish.activeBowlId = bowl.id;
      const stats = {
        durationMs: 2500,
        temperatureF: parseFloat((document.getElementById('oven-temp') as HTMLInputElement).value),
        targetTempF: 350,
        bakeMinutes: parseFloat((document.getElementById('oven-time') as HTMLInputElement).value),
        targetMinutes: 25,
      };
      completeStationAction({ id: 'oven', type: 'oven', label: 'Oven', x: 0, y: 0, width: 0, height: 0, interactable: true }, stats);
    };
  };
  render();
}

function bindMixerPanel(station: KitchenStation, selected: Set<string>, render: () => void): void {
  document.querySelectorAll<HTMLElement>('.mixer-bowl').forEach((card) => {
    card.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData('text/plain', card.dataset.bowlId ?? '');
    });
    card.addEventListener('click', () => {
      const id = card.dataset.bowlId;
      if (!id) return;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      render();
    });
  });
  const drop = document.getElementById('mixer-drop')!;
  drop.addEventListener('dragover', (event) => event.preventDefault());
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if (id) selected.add(id);
    render();
  });
  document.getElementById('mixer-close')!.onclick = hideOverlay;
  document.getElementById('mixer-run')!.onclick = () => runMixer(station, selected);
}

function runMixer(station: KitchenStation, selected: Set<string>): void {
  const bowlsToMix = currentDish.bowls.filter((bowl) => selected.has(bowl.id) && bowl.ingredients.length > 0);
  if (!bowlsToMix.length) {
    alert('Choose at least one bowl with ingredients.');
    return;
  }
  const mixedIngredients = bowlsToMix.flatMap((bowl) => bowl.ingredients);
  const mixedStates = bowlsToMix.flatMap((bowl) => bowl.states);
  const result = evaluateStation(station.type, {
    durationMs: 4500,
    taps: bowlsToMix.length * 8,
    dragDistance: bowlsToMix.length * 120,
    circularMotion: bowlsToMix.length * 180,
    verticalMotion: bowlsToMix.length * 80,
  });
  const newBowl = createBowl(currentDish.bowls.length + 1);
  newBowl.name = `${station.label} Bowl`;
  newBowl.ingredients = mixedIngredients;
  newBowl.techniques = [...new Set([...bowlsToMix.flatMap((bowl) => bowl.techniques), result.technique])];
  newBowl.states = mergeFoodStates(mixedStates, result.states);
  currentDish.bowls = [...currentDish.bowls.filter((bowl) => !selected.has(bowl.id)), newBowl];
  currentDish.activeBowlId = newBowl.id;
  currentDish.techniques.push(result.technique);
  currentDish.states = mergeFoodStates(currentDish.states, result.states);
  showDishHud(sessionStore.getState().freeCookActive);
  showOverlay(`
    <h2>Mixed Bowl</h2>
    <div class="bowl-grid">${renderBowlList([newBowl])}</div>
    ${speechBubble('Result', `${result.message} The selected bowls were combined into ${newBowl.name}.`)}
    ${button('mixer-ok', 'OK', true)}
  `, 'panel panel-scroll');
  document.getElementById('mixer-ok')!.onclick = hideOverlay;
}

function showDecorationPanel(): void {
  let actions = 0;
  const start = Date.now();
  const render = () => {
    showOverlay(`
      <h2>Decorate</h2>
      ${renderDishPreview(currentDish)}
      <div class="decor-tools">
        ${button('decor-frost', 'Frosting')}
        ${button('decor-drizzle', 'Drizzle')}
        ${button('decor-sprinkle', 'Sprinkles')}
      </div>
      ${button('decor-done', 'Finish', true)}
      ${button('decor-close', 'Close')}
    `, 'panel center-panel');
    document.getElementById('decor-frost')!.onclick = () => {
      currentDish.appearance.frosting = 'buttercream';
      actions++;
      render();
    };
    document.getElementById('decor-drizzle')!.onclick = () => {
      currentDish.appearance.topping = 'drizzle';
      actions++;
      render();
    };
    document.getElementById('decor-sprinkle')!.onclick = () => {
      currentDish.appearance.topping = 'sprinkles';
      currentDish.appearance.garnish = 'sparkle';
      actions++;
      render();
    };
    document.getElementById('decor-close')!.onclick = hideOverlay;
    document.getElementById('decor-done')!.onclick = () => {
      const result = evaluateStation('decorating', {
        durationMs: Date.now() - start,
        taps: actions * 5,
        dragDistance: actions * 140,
      });
      currentDish.techniques.push(result.technique);
      currentDish.states = mergeFoodStates(currentDish.states, result.states);
      hideOverlay();
      showOverlay(`${renderDishPreview(currentDish)}${speechBubble('Result', result.message)}${button('decor-ok', 'OK', true)}`, 'panel center-panel');
      document.getElementById('decor-ok')!.onclick = hideOverlay;
    };
  };
  render();
}

function getIngredientCategories(dish: Dish): Record<string, number> {
  return dish.ingredients.reduce<Record<string, number>>((counts, item) => {
    const category = getIngredientById(item.ingredientId)?.category ?? 'other';
    counts[category] = (counts[category] ?? 0) + item.amount;
    return counts;
  }, {});
}

function getBakingOutcomeStates(dish: Dish): { states: FoodState[]; messages: string[] } {
  const counts = getIngredientCategories(dish);
  const flour = counts.flour ?? 0;
  const dairy = counts.dairy ?? 0;
  const fruit = (counts.fruit ?? 0) + (counts.vegetable ?? 0);
  const fat = counts.fat ?? 0;
  const sugar = counts.sugar ?? 0;
  const leavener = counts.leavener ?? 0;
  const wet = dairy + fruit + (counts.other ?? 0);
  const states: FoodState[] = [];
  const messages: string[] = [];

  if (flour > 0 && leavener === 0) {
    states.push('dense', 'collapsed');
    messages.push('No leavener, so the bake did not rise much.');
  }
  if (flour > 0 && wet > flour * 2.2) {
    states.push('too_wet', 'soggy');
    messages.push('The mix was too wet for the flour.');
  }
  if (flour > 0 && wet < flour * 0.35 && fat < flour * 0.25) {
    states.push('dry');
    messages.push('The mix was too dry.');
  }
  if (flour > 0 && sugar > flour * 1.8) {
    states.push('too_sweet', 'collapsed');
    messages.push('The high sugar ratio weakened the structure.');
  }
  return { states, messages };
}

function completeStationAction(
  station: KitchenStation,
  stats: {
    durationMs: number;
    taps?: number;
    dragDistance?: number;
    circularMotion?: number;
    verticalMotion?: number;
    temperatureF?: number;
    targetTempF?: number;
    bakeMinutes?: number;
    targetMinutes?: number;
  },
): void {
  const result = evaluateStation(station.type, stats);
  const activeBowl = getActiveBowl();
  currentDish.techniques.push(result.technique);
  activeBowl.techniques.push(result.technique);
  currentDish.states = mergeFoodStates(currentDish.states, result.states);
  activeBowl.states = mergeFoodStates(activeBowl.states, result.states);
  if (station.type === 'oven') {
    currentDish.ovenTempF = stats.temperatureF;
    currentDish.bakeTimeMinutes = stats.bakeMinutes;
    const outcome = getBakingOutcomeStates(currentDish);
    currentDish.states = mergeFoodStates(currentDish.states, outcome.states);
    activeBowl.states = mergeFoodStates(activeBowl.states, outcome.states);
    currentDish.appearance.bakeStage = currentDish.states.includes('burned') || (stats.bakeMinutes ?? 0) > 40 || (stats.temperatureF ?? 350) > 425
      ? 'burned'
      : 'baked';
    currentDish.appearance.panShape = currentDish.appearance.baseShape === 'bread' ? 'loaf' : currentDish.appearance.baseShape === 'cookie' ? 'sheet' : 'round';
    if ((stats.bakeMinutes ?? 0) > 45 || (stats.temperatureF ?? 350) > 450) {
      currentDish.states = mergeFoodStates(currentDish.states, ['burned']);
      activeBowl.states = mergeFoodStates(activeBowl.states, ['burned']);
      currentDish.appearance.bakeStage = 'burned';
    }
    if (outcome.messages.length) result.message = `${result.message} ${outcome.messages.join(' ')}`;
  }
  hideOverlay();
  const preview = station.type === 'plating' || station.type === 'oven'
    ? renderDishPreview(currentDish, station.type === 'oven' ? 'pan' : 'plate')
    : '';
  showOverlay(`${preview}${speechBubble('Result', result.message)}${button('res-ok', 'OK', true)}`, preview ? 'panel center-panel' : 'panel');
  document.getElementById('res-ok')!.onclick = hideOverlay;
}

function showSimpleStationPanel(station: KitchenStation): void {
  const activeBowl = getActiveBowl();
  showOverlay(`
    <h2>${station.label}</h2>
    <div class="station-action-visual station-action-${station.type}">
      <div class="bowl-visual">${renderIngredientTokens(activeBowl)}</div>
      <strong>${station.label}</strong>
    </div>
    ${speechBubble('Station', `${station.label} will work on ${activeBowl.name}.`)}
    ${button('station-go', `Use ${station.label}`, true)}
    ${button('station-close', 'Close')}
  `, 'panel center-panel');
  document.getElementById('station-close')!.onclick = hideOverlay;
  document.getElementById('station-go')!.onclick = () => {
    completeStationAction(station, {
      durationMs: 3000,
      taps: 8,
      dragDistance: 160,
      circularMotion: 140,
      verticalMotion: 90,
    });
  };
}

function handleStation(station: KitchenStation): void {
  if (station.type === 'pantry' || station.type === 'refrigerator' || station.type === 'freezer') {
    const profile = sessionStore.getProfile();
    const allowed =
      station.type === 'pantry'
        ? PANTRY_CATEGORIES
        : station.type === 'refrigerator'
          ? FRIDGE_CATEGORIES
          : FREEZER_CATEGORIES;
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
      allowed,
      station.type === 'pantry' ? 'Dry Pantry' : station.type === 'refrigerator' ? 'Refrigerator' : 'Freezer',
    );
    return;
  }

  if (station.type === 'trash') {
    currentDish = createEmptyDish('New Dish');
    showDishHud(sessionStore.getState().freeCookActive);
    return;
  }

  if (station.type === 'prep_counter') {
    showBowlsPanel();
    return;
  }

  if (station.type === 'judging') {
    submitPlayerDish();
    return;
  }

  if (station.type === 'plating') {
    const name = prompt('Name your dish:', currentDish.name) ?? currentDish.name;
    currentDish.name = filterDishName(name);
    const bakedStage = currentDish.appearance.bakeStage;
    const panShape = currentDish.appearance.panShape;
    currentDish.appearance = {
      ...generateProceduralAppearance(currentDish.ingredients, currentDish.name),
      bakeStage: bakedStage ?? currentDish.appearance.bakeStage,
      panShape: panShape ?? currentDish.appearance.panShape,
    };
    showDishHud(sessionStore.getState().freeCookActive);
    showOverlay(`
      <h2>Plated Bake</h2>
      ${renderDishPreview(currentDish)}
      ${button('plate-ok', 'OK', true)}
    `, 'panel center-panel');
    document.getElementById('plate-ok')!.onclick = hideOverlay;
    return;
  }

  if (station.type === 'electric_mixer') {
    showMixerPanel(station);
    return;
  }

  if (station.type === 'decorating') {
    showDecorationPanel();
    return;
  }

  if (station.type === 'oven') {
    showOvenPanel();
    return;
  }

  showSimpleStationPanel(station);
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
