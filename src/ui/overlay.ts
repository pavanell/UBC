import type { CharacterAppearance, GenderPresentation, UnitSystem } from '../types';

export function clearOverlay(): void {
  const el = document.getElementById('ui-overlay');
  if (el) el.innerHTML = '';
}

export function showOverlay(html: string, className = 'panel'): HTMLElement {
  const el = document.getElementById('ui-overlay');
  if (!el) throw new Error('ui-overlay missing');
  el.innerHTML = `<div class="${className}">${html}</div>`;
  return el;
}

export function hideOverlay(): void {
  clearOverlay();
}

export function speechBubble(speaker: string, text: string): string {
  return `<div class="speech-bubble"><strong>${speaker}:</strong> ${text}</div>`;
}

export function button(id: string, label: string, primary = false): string {
  return `<button type="button" id="${id}" class="btn ${primary ? 'btn-primary' : ''}">${label}</button>`;
}

export function buildCharacterCreationForm(profile: {
  name: string;
  appearance: CharacterAppearance;
  unitSystem: UnitSystem;
}): string {
  const genders: GenderPresentation[] = ['girl', 'boy', 'nonbinary', 'prefer_not_say'];
  return `
    <h1>Create Your Baker</h1>
    ${speechBubble('Welcome', 'Choose your look before entering the kitchen!')}
    <label>Name <input id="cc-name" type="text" maxlength="20" value="${profile.name}" /></label>
    <label>Presentation
      <select id="cc-gender">${genders.map((g) => `<option value="${g}" ${profile.appearance.gender === g ? 'selected' : ''}>${g.replace('_', ' ')}</option>`).join('')}</select>
    </label>
    <label>Hairstyle
      <select id="cc-hair">${['short', 'curly', 'ponytail', 'braids', 'bun'].map((h) => `<option ${profile.appearance.hairstyle === h ? 'selected' : ''}>${h}</option>`).join('')}</select>
    </label>
    <label>Hair color <input id="cc-hair-color" type="color" value="${profile.appearance.hairColor}" /></label>
    <label>Skin tone <input id="cc-skin" type="color" value="${profile.appearance.skinTone}" /></label>
    <label>Clothing
      <select id="cc-clothing">${['apron', 'chef_jacket', 'hoodie', 'striped_shirt'].map((c) => `<option ${profile.appearance.clothing === c ? 'selected' : ''}>${c.replace('_', ' ')}</option>`).join('')}</select>
    </label>
    <label>Clothing color <input id="cc-cloth-color" type="color" value="${profile.appearance.clothingColor}" /></label>
    <label>Units
      <select id="cc-units"><option value="us" ${profile.unitSystem === 'us' ? 'selected' : ''}>US customary</option><option value="metric" ${profile.unitSystem === 'metric' ? 'selected' : ''}>Metric</option></select>
    </label>
    <div class="btn-row">${button('cc-start', 'Start Baking', true)}</div>
  `;
}

export function readCharacterCreationForm(): {
  name: string;
  appearance: CharacterAppearance;
  unitSystem: UnitSystem;
} {
  const name = (document.getElementById('cc-name') as HTMLInputElement).value.trim() || 'Baker';
  return {
    name,
    appearance: {
      gender: (document.getElementById('cc-gender') as HTMLSelectElement).value as GenderPresentation,
      hairstyle: (document.getElementById('cc-hair') as HTMLSelectElement).value,
      hairColor: (document.getElementById('cc-hair-color') as HTMLInputElement).value,
      skinTone: (document.getElementById('cc-skin') as HTMLInputElement).value,
      clothing: (document.getElementById('cc-clothing') as HTMLSelectElement).value,
      clothingColor: (document.getElementById('cc-cloth-color') as HTMLInputElement).value,
    },
    unitSystem: (document.getElementById('cc-units') as HTMLSelectElement).value as UnitSystem,
  };
}
