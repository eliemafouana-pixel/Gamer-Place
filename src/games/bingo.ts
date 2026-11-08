// Bingo à 75 boules, cartons 5×5 avec une case libre au centre.
// Le premier carton qui complète une ligne, une colonne ou une diagonale gagne.
import { melanger } from './hasard';

export type Carton = number[]; // 25 cases, ligne par ligne ; 0 = case libre
export const LETTRES = ['B', 'I', 'N', 'G', 'O'];

export function nouveauCarton(): Carton {
  const colonnes = LETTRES.map((_, c) => melanger(Array.from({ length: 15 }, (_, i) => c * 15 + i + 1)).slice(0, 5));
  const carton: Carton = [];
  for (let l = 0; l < 5; l++) for (let c = 0; c < 5; c++) carton.push(l === 2 && c === 2 ? 0 : colonnes[c][l]);
  return carton;
}

export const nouvelleUrne = () => melanger(Array.from({ length: 75 }, (_, i) => i + 1));

export const lettreDe = (n: number) => LETTRES[Math.floor((n - 1) / 15)];

const LIGNES: number[][] = [
  ...[0, 1, 2, 3, 4].map((l) => [0, 1, 2, 3, 4].map((c) => l * 5 + c)),
  ...[0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((l) => l * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function ligneGagnante(carton: Carton, sortis: Set<number>): number[] | null {
  return LIGNES.find((ligne) => ligne.every((i) => carton[i] === 0 || sortis.has(carton[i]))) ?? null;
}
