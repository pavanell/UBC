import { INGREDIENTS, INGREDIENT_CATEGORIES, searchIngredients } from '../data/ingredients';
import type { MeasuredIngredient } from '../types';
import { validateIngredientQuantity } from '../systems/ingredientQuantity';
import { button, showOverlay } from './overlay';

export function showIngredientPicker(
  onAdd: (item: MeasuredIngredient) => void,
  recentIds: string[],
  favoriteIds: string[],
): void {
  let query = '';
  let category = '';

  const render = () => {
    const results = searchIngredients(query, category || undefined).slice(0, 30);
    const recent = recentIds.map((id) => INGREDIENTS.find((i) => i.id === id)).filter(Boolean);
    showOverlay(`
      <h2>Ingredient Pantry</h2>
      <input id="ing-search" type="search" placeholder="Search ingredients..." value="${query}" />
      <select id="ing-category"><option value="">All categories</option>
        ${INGREDIENT_CATEGORIES.map((c) => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      ${recent.length ? `<p class="hint">Recent: ${recent.map((r) => r!.name).join(', ')}</p>` : ''}
      ${favoriteIds.length ? `<p class="hint">Favorites: ${favoriteIds.map((id) => INGREDIENTS.find((i) => i.id === id)?.name).filter(Boolean).join(', ')}</p>` : ''}
      <div class="ingredient-list" id="ing-list">
        ${results.map((i) => `
          <div class="ingredient-row" data-id="${i.id}">
            <span>${i.name}</span>
            <input type="number" min="0.25" step="0.25" value="1" class="ing-amount" />
            <select class="ing-unit"><option>${i.defaultUnit}</option><option>cup</option><option>tbsp</option><option>tsp</option><option>g</option><option>oz</option></select>
            <button type="button" class="btn btn-small ing-add">Add</button>
          </div>`).join('')}
      </div>
      ${button('ing-close', 'Close')}
    `, 'panel panel-scroll');

    document.getElementById('ing-search')?.addEventListener('input', (e) => {
      query = (e.target as HTMLInputElement).value;
      render();
    });
    document.getElementById('ing-category')?.addEventListener('change', (e) => {
      category = (e.target as HTMLSelectElement).value;
      render();
    });
    document.getElementById('ing-close')?.addEventListener('click', () => {
      document.getElementById('ui-overlay')!.innerHTML = '';
    });
    document.querySelectorAll('.ing-add').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const row = (e.target as HTMLElement).closest('.ingredient-row')!;
        const id = row.getAttribute('data-id')!;
        const amount = parseFloat((row.querySelector('.ing-amount') as HTMLInputElement).value);
        const unit = (row.querySelector('.ing-unit') as HTMLSelectElement).value;
        const check = validateIngredientQuantity(id, amount, unit);
        if (!check.valid) {
          alert(check.reason);
          return;
        }
        onAdd({ ingredientId: id, amount, unit });
      });
    });
  };

  render();
}

export function showMiniGamePanel(
  title: string,
  instruction: string,
  onComplete: (stats: {
    durationMs: number;
    taps: number;
    dragDistance: number;
    circularMotion: number;
    verticalMotion: number;
    targetAmount?: number;
    actualAmount?: number;
    temperatureF?: number;
    targetTempF?: number;
    bakeMinutes?: number;
    targetMinutes?: number;
  }) => void,
  options?: { mode?: 'mix' | 'oven' | 'measure' },
): void {
  const mode = options?.mode ?? 'mix';
  let taps = 0;
  let dragDistance = 0;
  let circularMotion = 0;
  let verticalMotion = 0;
  let lastX = 0;
  let lastY = 0;
  const start = Date.now();
  let tracking = false;

  const extraFields =
    mode === 'oven'
      ? `<label>Temp (F) <input id="mg-temp" type="number" value="350" /></label>
         <label>Time (min) <input id="mg-time" type="number" value="25" /></label>`
      : mode === 'measure'
        ? `<label>Target <input id="mg-target" type="number" value="1" readonly /></label>
           <label>Your amount <input id="mg-actual" type="number" step="0.25" value="1" /></label>`
        : '';

  showOverlay(`
    <h2>${title}</h2>
    <p>${instruction}</p>
    <div id="mg-area" class="minigame-area">Tap, drag, or circle here</div>
    ${extraFields}
    <p>Taps: <span id="mg-taps">0</span></p>
    ${button('mg-done', 'Finish', true)}
  `, 'panel');

  const area = document.getElementById('mg-area')!;
  area.addEventListener('pointerdown', (e) => {
    tracking = true;
    lastX = e.clientX;
    lastY = e.clientY;
    taps++;
    document.getElementById('mg-taps')!.textContent = String(taps);
  });
  area.addEventListener('pointermove', (e) => {
    if (!tracking) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    dragDistance += Math.hypot(dx, dy);
    circularMotion += Math.abs(dx);
    verticalMotion += Math.abs(dy);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('pointerup', () => {
    tracking = false;
  });

  document.getElementById('mg-done')?.addEventListener('click', () => {
    const durationMs = Date.now() - start;
    onComplete({
      durationMs,
      taps,
      dragDistance,
      circularMotion,
      verticalMotion,
      targetAmount: parseFloat((document.getElementById('mg-target') as HTMLInputElement | null)?.value ?? '1'),
      actualAmount: parseFloat((document.getElementById('mg-actual') as HTMLInputElement | null)?.value ?? '1'),
      temperatureF: parseFloat((document.getElementById('mg-temp') as HTMLInputElement | null)?.value ?? '350'),
      targetTempF: 350,
      bakeMinutes: parseFloat((document.getElementById('mg-time') as HTMLInputElement | null)?.value ?? '25'),
      targetMinutes: 25,
    });
  });
}
