// Ludo à 4 joueurs sur un plateau 15×15.
// Chaque pion a une progression : -1 = à la base, 0 à 50 = sur le circuit,
// 51 à 55 = dans son couloir, 56 = arrivé. Il faut un 6 pour sortir,
// et un nombre exact pour arriver. Un 6, une prise ou une arrivée rejouent.
import { entierAleatoire } from './hasard';

export type CouleurLudo = 'rouge' | 'vert' | 'jaune' | 'bleu';
export const ORDRE: CouleurLudo[] = ['rouge', 'vert', 'jaune', 'bleu'];
export const ARRIVEE = 56;

export type PartieLudo = {
  pions: Record<CouleurLudo, number[]>;
  tour: CouleurLudo;
  de: number | null;
  gagnant: CouleurLudo | null;
  message: string;
};

type Cellule = [number, number]; // [ligne, colonne]

// Le circuit commun, dans le sens des aiguilles d'une montre, depuis le départ rouge.
export const CIRCUIT: Cellule[] = [
  ...[1, 2, 3, 4, 5].map((c): Cellule => [6, c]),
  ...[5, 4, 3, 2, 1, 0].map((l): Cellule => [l, 6]),
  [0, 7],
  [0, 8],
  ...[1, 2, 3, 4, 5].map((l): Cellule => [l, 8]),
  ...[9, 10, 11, 12, 13, 14].map((c): Cellule => [6, c]),
  [7, 14],
  [8, 14],
  ...[13, 12, 11, 10, 9].map((c): Cellule => [8, c]),
  ...[9, 10, 11, 12, 13, 14].map((l): Cellule => [l, 8]),
  [14, 7],
  [14, 6],
  ...[13, 12, 11, 10, 9].map((l): Cellule => [l, 6]),
  ...[5, 4, 3, 2, 1, 0].map((c): Cellule => [8, c]),
  [7, 0],
  [6, 0],
];

const DEPART: Record<CouleurLudo, number> = { rouge: 0, vert: 13, jaune: 26, bleu: 39 };
const COULOIR: Record<CouleurLudo, Cellule[]> = {
  rouge: [1, 2, 3, 4, 5].map((c) => [7, c]),
  vert: [1, 2, 3, 4, 5].map((l) => [l, 7]),
  jaune: [13, 12, 11, 10, 9].map((c) => [7, c]),
  bleu: [13, 12, 11, 10, 9].map((l) => [l, 7]),
};
const BASE: Record<CouleurLudo, Cellule[]> = {
  rouge: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
  vert: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  jaune: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
  bleu: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]],
};
const CENTRE: Record<CouleurLudo, Cellule> = { rouge: [7, 6.3], vert: [6.3, 7], jaune: [7, 7.7], bleu: [7.7, 7] };

export const CASES_SURES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const caseCircuit = (c: CouleurLudo, progression: number) => (DEPART[c] + progression) % 52;

export function cellulePion(c: CouleurLudo, progression: number, indice: number): Cellule {
  if (progression < 0) return BASE[c][indice];
  if (progression <= 50) return CIRCUIT[caseCircuit(c, progression)];
  if (progression < ARRIVEE) return COULOIR[c][progression - 51];
  return CENTRE[c];
}

export const celluleDepart = (c: CouleurLudo) => CIRCUIT[DEPART[c]];
export const cellulesCouloir = (c: CouleurLudo) => COULOIR[c];

export function nouvellePartie(): PartieLudo {
  return {
    pions: { rouge: [-1, -1, -1, -1], vert: [-1, -1, -1, -1], jaune: [-1, -1, -1, -1], bleu: [-1, -1, -1, -1] },
    tour: 'rouge',
    de: null,
    gagnant: null,
    message: '',
  };
}

export const lancerDe = () => entierAleatoire(6) + 1;

export function pionsJouables(p: PartieLudo, de: number): number[] {
  return p.pions[p.tour]
    .map((pos, i) => ({ pos, i }))
    .filter(({ pos }) => (pos < 0 ? de === 6 : pos + de <= ARRIVEE))
    .map(({ i }) => i);
}

const suivant = (c: CouleurLudo) => ORDRE[(ORDRE.indexOf(c) + 1) % 4];

// Le dé a été lancé et aucun pion ne peut bouger : on passe la main.
export function passer(p: PartieLudo): PartieLudo {
  return { ...p, de: null, tour: suivant(p.tour), message: 'Aucun pion ne peut bouger' };
}

export function deplacer(p: PartieLudo, indice: number): PartieLudo {
  const de = p.de!;
  const c = p.tour;
  const pions = structuredClone(p.pions);
  const avant = pions[c][indice];
  const apres = avant < 0 ? 0 : avant + de;
  pions[c][indice] = apres;

  let prise = false;
  if (apres <= 50) {
    const caseAbs = caseCircuit(c, apres);
    if (!CASES_SURES.has(caseAbs)) {
      for (const autre of ORDRE) {
        if (autre === c) continue;
        pions[autre] = pions[autre].map((pos) => {
          if (pos >= 0 && pos <= 50 && caseCircuit(autre, pos) === caseAbs) {
            prise = true;
            return -1;
          }
          return pos;
        });
      }
    }
  }

  const arrive = apres === ARRIVEE;
  const gagnant = pions[c].every((x) => x === ARRIVEE) ? c : null;
  const rejoue = !gagnant && (de === 6 || prise || arrive);
  return {
    pions,
    de: null,
    gagnant,
    tour: gagnant || rejoue ? c : suivant(c),
    message: prise ? 'Pion capturé !' : arrive ? 'Un pion est arrivé !' : rejoue ? 'Un 6 : on rejoue' : '',
  };
}

// Choix de l'ordinateur : capturer, puis arriver, puis sortir un pion, sinon avancer le plus avancé.
export function choixBot(p: PartieLudo): number {
  const de = p.de!;
  const c = p.tour;
  const options = pionsJouables(p, de);
  const note = (i: number) => {
    const pos = p.pions[c][i];
    const apres = pos < 0 ? 0 : pos + de;
    let s = apres;
    if (apres <= 50) {
      const caseAbs = caseCircuit(c, apres);
      const capture = ORDRE.some((a) => a !== c && p.pions[a].some((x) => x >= 0 && x <= 50 && caseCircuit(a, x) === caseAbs));
      if (capture && !CASES_SURES.has(caseAbs)) s += 200;
      if (CASES_SURES.has(caseAbs)) s += 20;
    }
    if (apres === ARRIVEE) s += 150;
    if (pos < 0) s += 100;
    return s;
  };
  return options.reduce((m, i) => (note(i) > note(m) ? i : m), options[0]);
}
