import type { KitchenStation } from '../types';

export const KITCHEN_STATIONS: KitchenStation[] = [
  { id: 'pantry', type: 'pantry', label: 'Pantry', x: 40, y: 80, width: 70, height: 50, interactable: true },
  { id: 'fridge', type: 'refrigerator', label: 'Fridge', x: 130, y: 80, width: 60, height: 50, interactable: true },
  { id: 'freezer', type: 'freezer', label: 'Freezer', x: 210, y: 80, width: 60, height: 50, interactable: true },
  { id: 'sink', type: 'sink', label: 'Sink', x: 290, y: 80, width: 60, height: 50, interactable: true },
  { id: 'measuring', type: 'measuring', label: 'Measure', x: 40, y: 180, width: 60, height: 50, interactable: true },
  { id: 'prep', type: 'prep_counter', label: 'Prep', x: 120, y: 180, width: 80, height: 50, interactable: true },
  { id: 'cutting', type: 'cutting', label: 'Cut', x: 220, y: 180, width: 60, height: 50, interactable: true },
  { id: 'hand_mix', type: 'hand_mixing', label: 'Mix', x: 300, y: 180, width: 60, height: 50, interactable: true },
  { id: 'mixer', type: 'electric_mixer', label: 'Mixer', x: 40, y: 280, width: 60, height: 50, interactable: true },
  { id: 'blender', type: 'blender', label: 'Blender', x: 120, y: 280, width: 60, height: 50, interactable: true },
  { id: 'processor', type: 'food_processor', label: 'Processor', x: 200, y: 280, width: 70, height: 50, interactable: true },
  { id: 'stove', type: 'stove', label: 'Stove', x: 290, y: 280, width: 60, height: 50, interactable: true },
  { id: 'oven', type: 'oven', label: 'Oven', x: 40, y: 380, width: 70, height: 60, interactable: true },
  { id: 'microwave', type: 'microwave', label: 'Microwave', x: 130, y: 380, width: 60, height: 50, interactable: true },
  { id: 'proofing', type: 'proofing', label: 'Proof', x: 210, y: 380, width: 60, height: 50, interactable: true },
  { id: 'cooling', type: 'cooling', label: 'Cool', x: 290, y: 380, width: 60, height: 50, interactable: true },
  { id: 'decorating', type: 'decorating', label: 'Decorate', x: 80, y: 480, width: 80, height: 50, interactable: true },
  { id: 'plating', type: 'plating', label: 'Plate', x: 200, y: 480, width: 70, height: 50, interactable: true },
  { id: 'trash', type: 'trash', label: 'Trash', x: 300, y: 480, width: 50, height: 50, interactable: true },
  { id: 'judging', type: 'judging', label: 'Submit', x: 155, y: 580, width: 80, height: 50, interactable: true },
];

export const KITCHEN_WALLS = [
  { x: 0, y: 0, width: 390, height: 60 },
  { x: 0, y: 650, width: 390, height: 130 },
  { x: 0, y: 0, width: 20, height: 780 },
  { x: 370, y: 0, width: 20, height: 780 },
];

export function getStationAt(x: number, y: number): KitchenStation | undefined {
  return KITCHEN_STATIONS.find(
    (s) => x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height,
  );
}
