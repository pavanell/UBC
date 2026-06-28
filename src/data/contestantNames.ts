export const BAKER_FIRST_NAMES = [
  'Avery', 'Blake', 'Casey', 'Drew', 'Elliot', 'Finley', 'Gray', 'Harper',
  'Indigo', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Noah', 'Parker', 'Quinn',
  'Reese', 'Sage', 'Taylor', 'Wren',
];

export const JUDGE_OUTFITS = [
  { josh: 'chef_coat_white', nicole: 'apron_copper' },
  { josh: 'blazer_tan', nicole: 'dress_cream' },
  { josh: 'jacket_brown', nicole: 'cardigan_rose' },
  { josh: 'vest_copper', nicole: 'blouse_sage' },
];

export function randomBakerName(used: string[]): string {
  const available = BAKER_FIRST_NAMES.filter((n) => !used.includes(n));
  const pool = available.length ? available : BAKER_FIRST_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}
