// Machine à sous à 3 rouleaux. Les gains sont des multiplicateurs de la mise.
import { entierAleatoire } from './hasard';

export const SYMBOLES = [
  { s: '🍒', poids: 30, triple: 5 },
  { s: '🍋', poids: 25, triple: 8 },
  { s: '🔔', poids: 18, triple: 15 },
  { s: '⭐', poids: 12, triple: 25 },
  { s: '7️⃣', poids: 7, triple: 50 },
  { s: '💎', poids: 3, triple: 100 },
];
const TOTAL = SYMBOLES.reduce((t, x) => t + x.poids, 0);

export function symboleAleatoire(): string {
  let r = entierAleatoire(TOTAL);
  for (const x of SYMBOLES) {
    if (r < x.poids) return x.s;
    r -= x.poids;
  }
  return SYMBOLES[0].s;
}

export const lancer = (): [string, string, string] => [symboleAleatoire(), symboleAleatoire(), symboleAleatoire()];

// Trois symboles identiques : gain du tableau. Deux identiques : mise remboursée.
// Avec ces poids, la machine rend en moyenne 98 % des mises.
export function multiplicateur([a, b, c]: string[]): number {
  if (a === b && b === c) return SYMBOLES.find((x) => x.s === a)!.triple;
  if (a === b || b === c || a === c) return 1;
  return 0;
}
