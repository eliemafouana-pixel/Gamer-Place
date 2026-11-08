// Roulette européenne : un seul zéro, numéros de 0 à 36.
import { entierAleatoire } from './hasard';

export const ROUGES = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export type Pari =
  | { type: 'plein'; numero: number }
  | { type: 'rouge' | 'noir' | 'pair' | 'impair' | 'manque' | 'passe' }
  | { type: 'douzaine'; douzaine: 1 | 2 | 3 };

export const couleurNumero = (n: number) => (n === 0 ? 'vert' : ROUGES.has(n) ? 'rouge' : 'noir');

export function tirer() {
  return entierAleatoire(37);
}

export function cleDuPari(p: Pari): string {
  if (p.type === 'plein') return `plein-${p.numero}`;
  if (p.type === 'douzaine') return `douzaine-${p.douzaine}`;
  return p.type;
}

export function libelleDuPari(p: Pari): string {
  switch (p.type) {
    case 'plein':
      return `N° ${p.numero}`;
    case 'douzaine':
      return `${['1re', '2e', '3e'][p.douzaine - 1]} douzaine`;
    case 'manque':
      return '1 à 18';
    case 'passe':
      return '19 à 36';
    default:
      return p.type.charAt(0).toUpperCase() + p.type.slice(1);
  }
}

// Gain total rendu au joueur (mise comprise) ; 0 si le pari est perdu.
export function gainDuPari(p: Pari, mise: number, n: number): number {
  if (p.type === 'plein') return p.numero === n ? mise * 36 : 0;
  if (n === 0) return 0;
  const gagne =
    (p.type === 'rouge' && ROUGES.has(n)) ||
    (p.type === 'noir' && !ROUGES.has(n)) ||
    (p.type === 'pair' && n % 2 === 0) ||
    (p.type === 'impair' && n % 2 === 1) ||
    (p.type === 'manque' && n <= 18) ||
    (p.type === 'passe' && n >= 19) ||
    (p.type === 'douzaine' && Math.ceil(n / 12) === p.douzaine);
  if (!gagne) return 0;
  return p.type === 'douzaine' ? mise * 3 : mise * 2;
}
