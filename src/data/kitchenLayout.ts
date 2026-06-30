import type { KitchenStation } from '../types';

export const KITCHEN_STATIONS: KitchenStation[] = [
  { id: 'pantry', type: 'pantry', label: 'Pantry', x: 80, y: 120, width: 100, height: 90, interactable: true },
  { id: 'fridge', type: 'refrigerator', label: 'Fridge', x: 300, y: 120, width: 90, height: 110, interactable: true },
  { id: 'freezer', type: 'freezer', label: 'Freezer', x: 500, y: 120, width: 90, height: 90, interactable: true },
  { id: 'sink', type: 'sink', label: 'Sink', x: 700, y: 120, width: 110, height: 80, interactable: true },
  { id: 'prep', type: 'prep_counter', label: 'Bowls', x: 80, y: 360, width: 130, height: 90, interactable: true },
  { id: 'measuring', type: 'measuring', label: 'Measure', x: 330, y: 360, width: 110, height: 80, interactable: true },
  { id: 'cutting', type: 'cutting', label: 'Cut', x: 570, y: 360, width: 110, height: 80, interactable: true },
  { id: 'mixer', type: 'electric_mixer', label: 'Mixer', x: 760, y: 360, width: 110, height: 90, interactable: true },
  { id: 'blender', type: 'blender', label: 'Blender', x: 120, y: 610, width: 110, height: 85, interactable: true },
  { id: 'processor', type: 'food_processor', label: 'Processor', x: 330, y: 610, width: 120, height: 85, interactable: true },
  { id: 'stove', type: 'stove', label: 'Stove', x: 570, y: 610, width: 120, height: 90, interactable: true },
  { id: 'oven', type: 'oven', label: 'Oven', x: 760, y: 600, width: 120, height: 120, interactable: true },
  { id: 'microwave', type: 'microwave', label: 'Microwave', x: 100, y: 870, width: 120, height: 85, interactable: true },
  { id: 'proofing', type: 'proofing', label: 'Proof', x: 330, y: 870, width: 110, height: 80, interactable: true },
  { id: 'cooling', type: 'cooling', label: 'Cool', x: 560, y: 870, width: 110, height: 80, interactable: true },
  { id: 'decorating', type: 'decorating', label: 'Decorate', x: 760, y: 860, width: 130, height: 90, interactable: true },
  { id: 'plating', type: 'plating', label: 'Plate', x: 270, y: 1110, width: 120, height: 80, interactable: true },
  { id: 'trash', type: 'trash', label: 'Trash', x: 500, y: 1110, width: 90, height: 80, interactable: true },
  { id: 'judging', type: 'judging', label: 'Submit', x: 710, y: 1100, width: 130, height: 90, interactable: true },
];

export const KITCHEN_WALLS = [
  { x: 0, y: 0, width: 980, height: 70 },
  { x: 0, y: 1250, width: 980, height: 120 },
  { x: 0, y: 0, width: 30, height: 1370 },
  { x: 950, y: 0, width: 30, height: 1370 },
];

export function getStationAt(x: number, y: number): KitchenStation | undefined {
  return KITCHEN_STATIONS.find(
    (s) => x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height,
  );
}
